/**
 * sanitizeHtml — server-side HTML sanitizer for CMS-authored content.
 * Applied on WRITE (admin create/update) so stored data is clean for every
 * consumer (web, API, future mobile). This is the primary XSS defense for the
 * dangerouslySetInnerHTML render sites in the frontend.
 */
const sanitizeHtml = require('sanitize-html');

const allowedTags = [
  'p', 'br', 'strong', 'em', 'b', 'i', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div', 'hr', 'figure', 'figcaption',
  'iframe',
];

const allowedAttributes = {
  a: ['href', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  iframe: ['src', 'title', 'width', 'height', 'allowfullscreen', 'frameborder', 'allow'],
  '*': ['class', 'style'],
};

module.exports = function sanitizeHtmlContent(dirty) {
  if (typeof dirty !== 'string') return dirty;
  return sanitizeHtml(dirty, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] }, // data: for base64 images
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com', 'vimeo.com'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
    disallowedTagsMode: 'discard',
  });
};