const University = require('../models/University');
const { extractDomain, domainMatches } = require('./extractDomain');

async function resolveStudentUniversity(email) {
  const emailDomain = extractDomain(email);
  const universities = await University.find({});
  return (
    universities.find((university) =>
      domainMatches(emailDomain, university.domain)
    ) || null
  );
}

module.exports = { resolveStudentUniversity };
