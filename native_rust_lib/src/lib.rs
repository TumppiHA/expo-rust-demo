use std::ffi::{CString, CStr};
use std::os::raw::c_char;
use image::io::Reader as ImageReader;
use rqrr;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct Bounds {
    x_max: i32,
    y_max: i32,
    x_min: i32,
    y_min: i32
}

#[derive(Serialize, Deserialize)]
struct QRCode {
    pub content: String,
    pub bounds: Bounds
}
fn _read_qr(path: &str) -> Result<String, Box<dyn std::error::Error>> {
    let img = ImageReader::open(path.replace("file:", "").as_str())?.decode()?.to_luma8();
    let mut prepared_image = rqrr::PreparedImage::prepare(img);

    let grids = prepared_image.detect_grids();

    println!("grids: {}", grids.len());

    let codes_all: Vec<Result<QRCode, Box<dyn std::error::Error>>> = grids.iter().map(|grid| {
        let content = match grid.decode() {
            Ok((_, content)) => content,
            Err(e) => e.to_string(),
        };

        let xs = grid.bounds.map(|point| point.x);
        let ys = grid.bounds.map(|point| point.y);

        let x_max = *xs.iter().max().ok_or("No maximum x found")?;
        let y_max = *ys.iter().max().ok_or("No maximum y found")?;
        let x_min = *xs.iter().min().ok_or("No minimum x found")?;
        let y_min = *ys.iter().min().ok_or("No minimum y found")?;

        let bounds = Bounds {
            x_max,
            y_max,
            x_min,
            y_min,
        };

        let code = QRCode { content, bounds };
        Ok::<QRCode, Box<dyn std::error::Error>>(code)
    }).collect();

   let codes: Vec<QRCode> = codes_all.into_iter()
        .filter_map(Result::ok)  // This extracts only Ok values, ignoring Err
        .collect();

    let s = serde_json::to_string(&codes)?;
    Ok(s)
}

#[no_mangle]
pub extern "C" fn read_qr(c_path: *const c_char) -> *const c_char {
    let path = unsafe {CStr::from_ptr(c_path).to_str().unwrap()};
    let res: String = _read_qr(path).unwrap_or_else(|e| e.to_string());
    unsafe {CString::new(res).unwrap().into_raw()}
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
        let result_c_str = read_qr(env.get_string(&j_path).unwrap().into_raw());
        let result = unsafe { CStr::from_ptr(result_c_str).to_str().unwrap() };
        **env.new_string(result).unwrap()
    }
}