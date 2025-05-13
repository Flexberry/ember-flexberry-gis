import Ember from "ember";

export function parseLinkFromValue([text], htmlSafe = true) {
  if (!text) return text;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const linkedText = text.replace(
    urlRegex,
    (url) => `<a href="${url}" class="auto-parsed-link" target="_blank" rel="noopener noreferrer">${url}</a>`
  );

  return htmlSafe ? Ember.String.htmlSafe(linkedText) : linkedText;
}

export default Ember.Helper.helper(parseLinkFromValue);
