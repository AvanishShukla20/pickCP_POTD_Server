const axios = require('axios');
const CF_BASE = 'https://codeforces.com/api';

const getCFUserInfo = async (handle) => {
  const { data } = await axios.get(`${CF_BASE}/user.info`, {
    params: { handles: handle }
  });
  if (data.status !== 'OK') throw new Error('CF user not found');
  return data.result[0];
};

// get The Submission detail 

const getCFUserSubmissions = async (handle) => {
  const { data } = await axios.get(`${CF_BASE}/user.status`, {
    params: { handle, count: 10000 }
  });
  if (data.status !== 'OK') throw new Error('Error fetching CF submissions');
  return data.result; // includes verdict and problem info
};


const getCFAllProblems = async (tags) => {
  const params = {};
  if (tags && tags.length) params.tags = tags.join(';');
  const { data } = await axios.get(`${CF_BASE}/problemset.problems`, { params });
  if (data.status !== 'OK') throw new Error('Error fetching CF problemset');
  return data.result.problems; // array of { contestId, index, rating?, tags?, name, ... }
};

module.exports = { getCFAllProblems, getCFUserInfo, getCFUserSubmissions }