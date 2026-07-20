/**
 * Capitalizes the first letter of text and of segments after sentence
 * boundaries or colons. Leaves existing capitals and acronyms unchanged.
 */
export function formatQuizText(text: string): string {
  if (!text.trim()) return text;

  let result = capitalizeFirstAlpha(text);

  result = result.replace(
    /([.!?]\s+)([a-z])/g,
    (_, prefix, letter) => prefix + letter.toUpperCase()
  );

  result = result.replace(
    /(:)(\s*)([a-z])/g,
    (_, colon, space, letter) => colon + space + letter.toUpperCase()
  );

  return result;
}

function capitalizeFirstAlpha(text: string): string {
  const match = text.match(/^(\s*)([a-z])/);
  if (!match) return text;
  return match[1] + match[2].toUpperCase() + text.slice(match[0].length);
}
