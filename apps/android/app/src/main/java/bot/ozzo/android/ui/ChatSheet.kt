package bot.ozzo.android.ui

import androidx.compose.runtime.Composable
import bot.ozzo.android.MainViewModel
import bot.ozzo.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
