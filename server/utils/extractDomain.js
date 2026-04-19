function extractDomain(email = '') {
  const parts = email.toLowerCase().trim().split('@');
  return parts.length === 2 ? parts[1] : '';
}

function domainMatches(emailDomain, registeredDomain) {
  const normalizedEmailDomain = emailDomain.toLowerCase();
  const normalizedRegisteredDomain = registeredDomain.toLowerCase();

  return (
    normalizedEmailDomain === normalizedRegisteredDomain ||
    normalizedEmailDomain.endsWith(`.${normalizedRegisteredDomain}`)
  );
}

module.exports = { extractDomain, domainMatches };
