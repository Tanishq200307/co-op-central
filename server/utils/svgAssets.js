const fs = require('fs');
const path = require('path');

const COLOR_PALETTE = [
  '#2563EB',
  '#0F766E',
  '#7C3AED',
  '#DC2626',
  '#CA8A04',
  '#0891B2',
  '#4F46E5',
];

function hashString(value = '') {
  return value
    .split('')
    .reduce(
      (accumulator, character) => accumulator + character.charCodeAt(0),
      0
    );
}

function initialsFromText(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function buildSvg({ label, bgColor, textColor = '#FFFFFF' }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="160" height="160" rx="80" fill="${bgColor}" />
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="700">${label}</text>
</svg>`;
}

function createSvgAsset(folderName, fileName, labelSeed) {
  const uploadsDir = path.join(__dirname, '..', 'uploads', folderName);
  ensureDir(uploadsDir);

  const hashed = hashString(labelSeed);
  const bgColor = COLOR_PALETTE[hashed % COLOR_PALETTE.length];
  const label = initialsFromText(labelSeed);
  const filePath = path.join(uploadsDir, fileName);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, buildSvg({ label, bgColor }), 'utf8');
  }

  return `/uploads/${folderName}/${fileName}`;
}

function ensureCompanyLogo(slug, companyName) {
  return createSvgAsset('logos', `${slug}.svg`, companyName);
}

function ensureAvatar(slug, fullName) {
  return createSvgAsset('avatars', `${slug}.svg`, fullName);
}

function ensurePlaceholderResume(fileName, title) {
  const resumesDir = path.join(__dirname, '..', 'uploads', 'resumes');
  ensureDir(resumesDir);
  const filePath = path.join(resumesDir, fileName);

  if (!fs.existsSync(filePath)) {
    const content = [
      'Demo Resume',
      '',
      title,
      'This seeded resume is included for walkthrough purposes.',
    ].join('\n');

    fs.writeFileSync(filePath, content, 'utf8');
  }

  return `/uploads/resumes/${fileName}`;
}

module.exports = {
  ensureAvatar,
  ensureCompanyLogo,
  ensurePlaceholderResume,
};
