import PropTypes from 'prop-types';

import { withApollo } from '../graphql/withApollo';
import Page from '../components/Page/Page';
import Head from '../components/Head/Head';
import LayoutMain from '../components/LayoutMain/LayoutMain';
import HeaderDetail from '../components/HeaderDetail/HeaderDetail';
import IdeaDetail from '../components/IdeaDetail/IdeaDetail';
import authenticate from '../utils/authenticate';

const IdeaPage = props => (
  <Page>
    <Head title="Idea Detail" />

    <LayoutMain
      header={<HeaderDetail ideaId={props.ideaId} />}
      content={<IdeaDetail ideaId={props.ideaId} />}
    />
  </Page>
);

// IdeaPage.getInitialProps = props => {
//   const { req, query, apolloClient } = props;
//   const ideaId = query.id;

//   if (req) authenticate(req, apolloClient);

//   return { ideaId };
// };

IdeaPage.propTypes = {
  ideaId: PropTypes.string.isRequired
};

export default withApollo(React.memo(IdeaPage));
