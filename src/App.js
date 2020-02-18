import React, { Component, Suspense, lazy } from 'react';
import { Form, Input, Button } from 'reactstrap';

import GitHub from './repository/git-hub-repository';
import Loading from './assests/loading.gif';

const Grid = lazy(() => import('./components/table'));
class App extends Component {
  divInfiniteScrollRef;

  state = {
    term: null,
    showLoading: false,
    page: 1,
    repositories: []
  };

  constructor() {
    super();
    this.divInfiniteScrollRef = React.createRef();
  }

  getRepositories = async () => {
    const { page, term } = this.state;

    const terms = await GitHub.findRepositoriesGithub(term, page);

    this.setState({ repositories: terms.data.items });
  };

  componentDidMount() {
    const intersectionObserver = new IntersectionObserver((entries) => {
      const ratio = entries[0].intersectionRatio;

      if (ratio > 0 && this.state.term !== null) {
        this.setState({ page: this.state.page + 1, showLoading: true }, () => {
          GitHub.findRepositoriesGithub(this.state.term, this.state.page)
            .then(({ data }) => {
              const repositoriesOld = this.state.repositories;
              repositoriesOld.push(...data.items);

              this.setState({ repositories: repositoriesOld, showLoading: false });
            });
        });
      }
    });

    intersectionObserver.observe(this.divInfiniteScrollRef.current);
  };

  render() {
    const { repositories, showLoading } = this.state;

    return (
      <div className={'p-4'}>
        <h1>Digite um Termo</h1>
        <Form>
          <Input onChange={(e) => this.setState({ term: e.target.value })} />
          <br />
          <Button color={'primary'} onClick={this.getRepositories} >Buscar</Button>
        </Form>
        <br />
        <br />
        <Suspense fallback={<div>Loading...</div>}>
          <section>
            <Grid repositories={repositories} />
          </section>
        </Suspense>

        <div ref={this.divInfiniteScrollRef}></div>
        {showLoading && <img src={Loading} width={50} alt='Carregando' />}
      </div>
    );
  };
}

export default App;
