use std::ffi::{CStr, CString};
use native_rust_lib::read_qr;

fn main() {

    // Call the read_qr function and directly assume the returned pointer is valid
    let content_c_str = unsafe { read_qr(CString::new("QR-screenshot.png").unwrap().as_ptr()) };

    // Convert the C string returned by read_qr back to a Rust String
    println!("Decoded QR Content: {}", unsafe { CStr::from_ptr(content_c_str).to_string_lossy().into_owned() });

}
