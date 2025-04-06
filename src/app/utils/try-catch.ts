interface Success<T> {
  data: T;
  error: null;
}

interface Failure<E> {
  data: null;
  error: E;
}

type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Wrapper to handle errors in promises
 * @param promise promise to execute
 * @returns returns an object with the data or the error
 */
export const tryCatch = async <T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> => {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
};
