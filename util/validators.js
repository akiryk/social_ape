const isEmpty = (string = "") => string.trim() === "";

const isEmail = email => {
  // eslint-disable-next-line
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(emailRegEx) ? true : false;
};

exports.validateSignupData = ({ email, password, confirmPassword, handle }) => {
  let errors = {};
  if (isEmpty(email)) {
    errors.email = "must not be empty";
  } else if (!isEmail(email)) {
    errors.email = "must be a valid address";
  }

  if (isEmpty(password)) {
    errors.password = "must not be empty";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "passwords must match";
  }

  if (isEmpty(handle)) {
    errors.handle = "must not be empty";
  }

  const isValid = Object.keys(errors).length === 0 ? true : false;

  return { isValid, errors };
};

exports.validateLoginData = user => {
  let errors = {};
  if (isEmpty(user.email)) {
    errors.email = "must not be empty";
  }

  if (isEmpty(user.password)) {
    errors.password = "must not be empty";
  }

  const isValid = Object.keys(errors).length === 0 ? true : false;

  return { isValid, errors };
};

exports.reduceUserDetails = user => {
  let userDetails = {};
  if (user.bio && !isEmpty(user.bio.trim())) {
    userDetails.bio = user.bio.trim();
  }
  if (user.website && !isEmpty(user.website.trim())) {
    userDetails.website = user.website.trim();
  }
  if (user.location && !isEmpty(user.location.trim())) {
    userDetails.location = user.location.trim();
  }
  return userDetails;
};
