package bot.ozzo.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class OzzoProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", OzzoCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", OzzoCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", OzzoCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", OzzoCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", OzzoCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", OzzoCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", OzzoCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", OzzoCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", OzzoCapability.Canvas.rawValue)
    assertEquals("camera", OzzoCapability.Camera.rawValue)
    assertEquals("screen", OzzoCapability.Screen.rawValue)
    assertEquals("voiceWake", OzzoCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", OzzoScreenCommand.Record.rawValue)
  }
}
