fn main() {
    // No app-local Android plugin in this body: the mother's media-permission
    // bridge existed only to hand cpal a JNI context, and cpal did not cross —
    // scribe holds no microphone, no camera and no sound. Nothing here asks
    // the vessel for a runtime permission, so `android-extras/extras.json`
    // declares none.
    tauri_build::build();

    // The mother's jniLibs link block did not cross either: it existed so the
    // linker found `libc++_shared.so` for cpal's oboe backend without dragging
    // in the NDK's `libc.a`. With no C++ audio stack there is nothing to link,
    // and rusqlite's bundled SQLite is C, not C++.
}
