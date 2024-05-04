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
pub unsafe extern "C" fn qr_get_bounds(ptr: *const QR) -> *const i32 {
    unsafe {
        let qr = &*ptr;  // Safely dereference the pointer within an unsafe block
        return qr.bounds.as_ptr(); // Return a pointer to the data in the vector
    }
}



/// cbindgen:ignore
#[cfg(target_os = "android")]
pub mod android {
    use super::*;
    use jni::JNIEnv;
    use jni::objects::{JClass, JString};
    use jni::sys::{jstring, jlong, jintArray};

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

    #[no_mangle]
    pub unsafe extern "C" fn Java_com_example_project_MyRustModule_getQrBounds(
        env: JNIEnv,
        _class: JClass,
        qr_ptr: jlong,
    ) -> jintArray {
        // Direct cast from jlong to *const QR
        let qr = qr_ptr as *const QR;

        // Directly access the bounds vector from the QR struct
        let bounds = &(*qr).bounds;

        // Create a new jintArray of the correct size
        let bounds_array = env.new_int_array(bounds.len() as i32).unwrap();
        let b = **bounds_array;

        // Set the jintArray elements to the values from the bounds vector
        env.set_int_array_region(bounds_array, 0, bounds).unwrap();

        // Return the jintArray
        b
    }
}