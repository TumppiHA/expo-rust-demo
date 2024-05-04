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
    AsyncFunction("readQr") { (path: String) -> String in
      let cPath = path.cString(using: .utf8)!  // Convert Swift String to C-String
      let resultPtr = read_qr(cPath)  // Assuming read_qr is exposed and callable
      let result = String(cString: resultPtr)  // Convert back to Swift String from C-String
      free(resultPtr)  // Don't forget to free the memory if it's allocated in Rust
      return result
    }

    View(MyRustModuleView.self) {
      Prop("name") { (view: MyRustModuleView, prop: String) in
        print(prop)
      }
    }
  }
}