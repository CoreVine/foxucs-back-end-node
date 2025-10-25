/**
 * Standard success response formatter
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 * @param {object|array} data - Response data
 * @param {object} pagination - Pagination details (optional)
 * @returns {object} Formatted success response
 */
const formatSuccessResponse = (message, status = 200, data, pagination = null) => {
  const response = {
    message,
    status
  };

  if (pagination) {
    // For paginated data
    response.data = {
      page: pagination.page,
      nextPage: pagination.nextPage,
      lastPage: pagination.lastPage,
      itemCount: pagination.itemCount,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      data: data || []
    };
  } else if (Array.isArray(data)) {
    // For unpaginated multiple items
    response.data = {
      data
    };
  } else {
    // For single item
    response.data = data;
  }

  return response;
};

/**
 * Standard error response formatter
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {object} Formatted error response
 */
const formatErrorResponse = (message, status = 400) => {
  return {
    data: {
      message
    },
    status
  };
};

/**
 * Create pagination object from query results
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total number of items
 * @returns {object} Pagination object
 */
const createPagination = (page, limit, totalItems) => {
  const currentPage = parseInt(page, 10) || 1;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    page: currentPage,
    nextPage: currentPage < totalPages ? currentPage + 1 : null,
    lastPage: currentPage > 1 ? currentPage - 1 : null,
    itemCount: limit,
    totalPages,
    totalItems
  };
};

const success = (res, data = null, status = 200, message = 'Success') => {
  const response = formatSuccessResponse(message, status, data);
  return res.status(status).json(response);
};

const error = (res, message = 'Error', status = 400) => {
  const response = formatErrorResponse(message, status);
  return res.status(status).json(response);
};

const paginated = (res, data, page, limit, totalItems, status = 200, message = 'Success') => {
  const pagination = createPagination(page, limit, totalItems);
  const response = formatSuccessResponse(message, status, data, pagination);
  return res.status(status).json(response);
};

module.exports = {
  formatSuccessResponse,
  formatErrorResponse,
  createPagination,
  success,
  error,
  paginated
};
