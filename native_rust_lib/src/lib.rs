use std::ffi::{CString, CStr};
use std::os::raw::c_char;
use image::io::Reader as ImageReader;
use rqrr;


// Function to create a QR struct by reading an image file
#[no_mangle]
pub extern "C" fn read_qr(c_path: *const c_char) -> *const c_char {
    let path = unsafe {CStr::from_ptr(c_path).to_str().unwrap()};
    let img = ImageReader::open(path).unwrap().decode().unwrap().to_luma8();
    let mut prepared_image = rqrr::PreparedImage::prepare(img);

    let grids = prepared_image.detect_grids();
    assert!(!grids.is_empty(), "No QR codes found");

    let grid = &grids[0];
    let (_, content) = grid.decode().unwrap();

    CString::new(content).unwrap().into_raw()
}

/// cbindgen:ignore
#[cfg(target_os = "android")]
pub mod android {
    use super::*;
    use jni::JNIEnv;
    use jni::objects::{JClass, JString};
    use jni::sys::jstring;

    #[no_mangle]
    pub extern "C" fn Java_expo_modules_myrustmodule_MyRustModule_readQr(
        mut env: JNIEnv,
        class: JClass,
        j_path: JString,
    ) -> jstring {

        // Call the Rust function
        let content_c_str = read_qr(env.get_string(&j_path).unwrap().into_raw());

        // Convert C string back to Java string
        let content = unsafe { CStr::from_ptr(content_c_str).to_str().unwrap() };
        **env.new_string(content).unwrap()
    }
}