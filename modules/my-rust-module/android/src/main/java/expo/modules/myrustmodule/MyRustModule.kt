package expo.modules.myrustmodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyRustModule : Module() {
  companion object {
    // Load the native library
    init {
      System.loadLibrary("native_rust_lib")  // Ensure this matches your actual library name
    }
  }

  // Declare external functions matching the Rust implementations
  external fun readQr(path: String): Long
  external fun freeQr(qrPtr: Long)
  external fun getQrContent(qrPtr: Long): String
  external fun getQrBounds(qrPtr: Long): IntArray

  override fun definition() = ModuleDefinition {
    Name("MyRustModule")

    Constants("PI" to Math.PI)

    Events("onChange")

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("readQr") { path: String ->
      val qrPtr = readQr(path)
      val content = getQrContent(qrPtr)
      val bounds = getQrBounds(qrPtr)
      freeQr(qrPtr)
      mapOf("content" to content, "bounds" to bounds)
    }

    AsyncFunction("setValueAsync") { value: String ->
      sendEvent("onChange", mapOf("value" to value))
    }

    View(MyRustModuleView::class) {
      Prop("name") { view: MyRustModuleView, prop: String ->
        println(prop)
      }
    }
  }
}
