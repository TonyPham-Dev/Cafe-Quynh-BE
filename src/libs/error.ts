export const MyError = {
  NotValidate(message: string, params: any = {}) {
    const { error = null, data = null } = params;
    return {
      message,
      status: 400,
      code: 'NotValidate',
      data,
      error,
      ok: false,
    };
  },
  NotFound(message: string, params: any = {}) {
    const { error = null, data = null } = params;
    return {
      message,
      status: 404,
      code: 'NotFound',
      data,
      error,
    };
  },
  NotAuthenticated(message: string, params: any = {}) {
    const { error = null, data = null } = params;
    return {
      message,
      status: 401,
      code: 'NotAuthenticated',
      data,
      error,
    };
  },
  PermissionDenied(message: string, params: any = {}) {
    const { error = null, data = null } = params;
    return {
      message,
      status: 403,
      code: 'PermissionDenied',
      data,
      error,
    };
  },
  ServerError(message: string, params: any = {}) {
    const { error = null, data = null } = params;
    return {
      message,
      status: 500,
      code: 'ServerError',
      data,
      error,
    };
  },
  ConfigNotExists(message = 'config not exists', params: any = {}) {
    const { error = null, data = null } = params;
    return {
      message,
      status: 500,
      code: 'ServerError',
      data,
      error,
    };
  },
  errorDuplicate(message: string, params: any = {}) {
    const { error = null, data = null } = params;
    return {
      message,
      status: 400,
      code: 'Duplicate',
      data,
      error,
    };
  },
};
