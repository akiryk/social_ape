const isEmpty = (string = "") => string.trim() === "";

const isEmail = email => {
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

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const isValid = Object.keys(errors).length === 0 ? true : false;

  return { isValid, errors };
};
