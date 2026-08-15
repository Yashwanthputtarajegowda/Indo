import { updateAccountVisibility } from "./update-visibility.js";

export async function setSettingsVisibility(accountType) {
  return updateAccountVisibility(accountType);
}
