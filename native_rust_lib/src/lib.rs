use std::ffi::{CString, CStr};
use std::os::raw::c_char;
use image::io::Reader as ImageReader;
use rqrr;

#[repr(C)]
pub struct QR {
    pub content: *mut c_char,
    pub bounds: Vec<i32>,
}

impl QR {
    fn new(content: &str, bounds: Vec<i32>) -> QR {
        let content_c = CString::new(content).expect("CString::new failed");
        QR {
            content: content_c.into_raw(),
            bounds
        }
    }
}

// Function to create a QR struct by reading an image file
#[no_mangle]
pub extern "C" fn read_qr(path: *const c_char) -> *mut QR {
    unsafe {
        let path_str = CStr::from_ptr(path).to_str().unwrap();
        let img = ImageReader::open(path_str).unwrap().decode().unwrap().to_luma8();
        let mut prepared_image = rqrr::PreparedImage::prepare(img);

        let grids = prepared_image.detect_grids();
        assert!(!grids.is_empty(), "No QR codes found");

        let grid = &grids[0];
        let (meta, content) = grid.decode().unwrap();

        let bounds = grid.bounds.iter()
            .flat_map(|p| vec![p.x, p.y]).collect::<Vec<i32>>();

        Box::into_raw(Box::new(QR::new(&content, bounds)))
    }
}

#[no_mangle]
pub extern "C" fn qr_free(ptr: *mut QR) {
    if !ptr.is_null() {
        unsafe {
            drop(Box::from_raw(ptr));
        }
    }
}

#[no_mangle]
pub extern "C" fn qr_get_content(ptr: *const QR) -> *const c_char {
    unsafe { (*ptr).content }
}

#[no_mangle]
pub extern "C" fn qr_get_bounds(ptr: *const QR, out_bounds: *mut i32, max_len: usize) -> usize {
    unsafe {
        let bounds = &(*ptr).bounds;
        let len = bounds.len();
        let to_copy = std::cmp::min(len, max_len);
        std::ptr::copy_nonoverlapping(bounds.as_ptr(), out_bounds, to_copy);
        to_copy
    }
}



/// cbindgen:ignore
#[cfg(target_os = "android")]
pub mod android {
    use super::*;
    use jni::JNIEnv;
    use jni::objects::{JClass, JString};
    use jni::sys::{jstring, jlong};

    #[no_mangle]
    pub unsafe extern "C" fn Java_com_example_project_MyRustModule_readQr(
        mut env: JNIEnv,
        _class: JClass,
        path: JString,
    ) -> jlong {
        let jstring = env.get_string(&path).expect("Couldn't get Java string!");
        let path_str = jstring.to_str().unwrap();

        let path_c_str = CString::new(path_str).unwrap(); // Convert to CString to get a valid pointer

        // Assuming `crate::read_qr()` expects a `*const c_char`
        let qr_ptr = crate::read_qr(path_c_str.as_ptr());

        qr_ptr as jlong
    }

    /// JNI function to free a QR object
    #[no_mangle]
    pub unsafe extern "C" fn Java_com_example_project_MyRustModule_freeQr(
        env: JNIEnv,
        _class: JClass,
        qr_ptr: jlong,
    ) {
        let qr = qr_ptr as *mut QR;
        crate::qr_free(qr);
    }

    /// JNI function to get QR content
    #[no_mangle]
    pub unsafe extern "C" fn Java_com_example_project_MyRustModule_getQrContent(
        env: JNIEnv,
        _class: JClass,
        qr_ptr: jlong,
    ) -> jstring {
        let qr = qr_ptr as *const QR;
        let content = crate::qr_get_content(qr);
        **(env.new_string(CStr::from_ptr(content).to_str().unwrap()).unwrap())
    }

    /// JNI function to get QR bounds
    #[no_mangle]
    pub unsafe extern "C" fn Java_com_example_project_MyRustModule_getQrBounds(
        env: JNIEnv,
        _class: JClass,
        qr_ptr: jlong,
        out_bounds: *mut i32,
        max_len: usize,
    ) -> usize {
        let qr = qr_ptr as *const QR;
        let bounds_len = crate::qr_get_bounds(qr, out_bounds, max_len);
        bounds_len
    }
}