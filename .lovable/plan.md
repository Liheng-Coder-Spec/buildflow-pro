# Telegram Bot: Edit-in-Place Menu Cards

## Goal
When a user taps a main-menu inline button (Dashboard, My Tasks, Briefs, Settings, Help, Back, etc.), the bot edits the existing card message instead of sending a new one. Only one active menu card is visible in the chat at any time. Typed commands and the bottom reply keyboard keep current behavior (send a new card).

## Behavior

- Tap **Dashboard** → bot sends one card with Dashboard content + inline menu buttons.
- Tap **My Tasks** on that card → the same message is edited in place to show My Tasks content + inline menu buttons.
- Tap **Briefs**, **Settings**, **Help**, **Back** → same edit-in-place swap.
- Typing `/start`, `/help`, or tapping a bottom reply-keyboard button → sends a fresh card (unchanged).
- Task detail drill-ins, update confirmations, and notifications → unchanged (still new messages).

## Implementation (single file: `supabase/functions/telegram-webhook/index.ts`)

1. **Detect callback queries** from inline buttons. Telegram delivers these as `update.callback_query` with `message.message_id` and `chat.id` of the original card.
2. **Add an `editCard(chatId, messageId, text, replyMarkup)` helper** that calls `editMessageText` via the connector gateway (same `tgApi` pattern already in use). Fall back to `sendMessage` if the edit fails (e.g. message too old / identical content / not found).
3. **Refactor the main-menu render functions** (Dashboard, My Tasks, Briefs, Settings, Help, Back) to return `{ text, reply_markup }` instead of sending directly. A single dispatcher then either:
   - calls `sendMessage` (entry via `/start`, `/help`, or reply-keyboard tap), or
   - calls `editCard` (entry via inline `callback_query` whose `data` matches a main-menu action).
4. **Always answer the callback query** with `answerCallbackQuery` so Telegram clears the button spinner.
5. **Keep the inline keyboard identical** across all main-menu views so the user can jump between sections from any card.
6. **Leave non-menu callbacks alone** (task actions, pagination inside a detail view, settings sub-actions) — those keep their current send/edit behavior.

## Out of Scope
- No DB schema changes.
- No changes to `telegram-link-code`, `telegram-task-update`, `telegram-notify`, `telegram-briefs`.
- No change to the bottom reply keyboard or to typed-command flows.
- Task detail views and confirmations are not converted to edit-in-place in this pass.

## Verification
- Deploy `telegram-webhook`.
- From a linked chat: `/start` → tap Dashboard → tap My Tasks → tap Briefs → tap Back. Confirm the same message updates each time (no new cards stacked).
- Confirm typing `/start` again still posts a fresh card.
- Check edge function logs for any `editMessageText` errors and confirm the `sendMessage` fallback kicked in if needed.
