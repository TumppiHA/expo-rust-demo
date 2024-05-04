use image::io::Reader as ImageReader;
use rqrr;

#[no_mangle]
pub extern "C" fn read_qr(uri: &str) -> String {
    let img = ImageReader::open(uri).unwrap().decode().unwrap().to_luma8();
    let mut img = rqrr::PreparedImage::prepare(img);
    // Search for grids, without decoding
    let grids = img.detect_grids();
    // Decode the grid
    let (meta, content) = grids[0].decode().unwrap();
    content
}

/// cbindgen:ignore
#[cfg(target_os = "android")]
pub mod android {
    use crate::read_qr;
    use jni::JNIEnv;
    use jni::objects::JClass;
    use jni::sys::jstring;

    #[no_mangle]
    pub unsafe extern "C" fn Java_expo_modules_myrustmodule_MyRustModule_readQr(
        env: JNIEnv,
        _class: JClass,
        uri: jstring
    ) -> jstring {
        // Convert Java string to Rust string
        let rust_uri = env.get_string(uri).unwrap().to_str().unwrap();

        // Call read_qr with the Rust string
        let result = read_qr(rust_uri);

        // Convert the result back to a Java string
        let output = env.new_string(result).unwrap().into_inner();
        output
    }
}