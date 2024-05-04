public class MyRustModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyRustModule")

    Constants([
      "PI": Double.pi
    ])

    Events("onChange")

    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { (value: String) in
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    // Adding the readQr function
        AsyncFunction("readQr") { (path: String) async -> [String: Any] in
            // Convert the string to a format suitable for Rust function calling
            let cPath = path.cString(using: .utf8)!
            
            // Assuming the following functions are available and properly bridged:
            // - readQr(_:): Reads the QR and returns a pointer to a QR structure
            // - getQrContent(_:): Returns the content from the QR structure
            // - getQrBounds(_:): Returns the bounds from the QR structure
            // - freeQr(_:): Frees the allocated QR structure
            let qrPtr = readQr(cPath)  // Call Rust function to read QR
            
            // Extract content and bounds
            guard let content = getQrContent(qrPtr), let bounds = getQrBounds(qrPtr) else {
                // Handle potential null values or errors appropriately
                freeQr(qrPtr)
                return ["error": "Failed to decode QR code"]
            }
            
            // Convert the bounds to a more Swift-friendly format, e.g., an array of Int
            let boundsArray = Array(UnsafeBufferPointer(start: bounds, count: 8))
            
            // Cleanup: free the QR structure after extracting data
            freeQr(qrPtr)
            
            // Return the results as a dictionary
            return [
                "content": String(cString: content),
                "bounds": boundsArray
            ]

    View(MyRustModuleView.self) {
      Prop("name") { (view: MyRustModuleView, prop: String) in
        print(prop)
      }
    }
  }
}