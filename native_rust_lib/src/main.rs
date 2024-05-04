use native_rust_lib::read_qr;

fn main() {
    let result = read_qr("qr_image.jpg");
    println!("url: {}", result);
}