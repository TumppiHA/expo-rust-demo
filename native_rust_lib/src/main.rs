use std::ffi::CString;
use native_rust_lib::read_qr;

fn main() {
    let result = read_qr(CString::new("qr_image.jpg").unwrap().as_ptr());
    unsafe { println!("url: {}", CString::from_raw((*result).content).to_str().unwrap()); }
    unsafe { println!("bounds: {:?}", (*result).bounds) }
}
