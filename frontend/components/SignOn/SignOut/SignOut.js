import { Mutation } from 'react-apollo';
import * as query from './SignOut.query';
import * as Styled from './SignOut.style';

const SignOut = React.memo(() => {
  const handleClickBtn = async (signOut, client) => {
    await signOut();
    await client.resetStore();
  };

  const handleError = error => error;

  return (
    <Mutation mutation={query.SIGN_OUT_MUTATION} onError={handleError}>
      {(signOut, { loading, client }) => (
        <Styled.div>
          <button
            type="button"
            disabled={loading}
            aria-busy={loading}
            onClick={() => handleClickBtn(signOut, client)}
          >
            Sign Out
          </button>
        </Styled.div>
      )}
    </Mutation>
  );
});

export default SignOut;
