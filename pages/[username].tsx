import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import ContributionsChart from "components/charts/Contributions/ContributionsChart";
import LanguagesCharts from "components/charts/Languages/LanguagesCharts";
import FadeTransition from "components/FadeTransition/FadeTransition";
import Page from "components/Page";
import SearchForm from "components/SearchForm/SearchForm";
import Spinner from "components/Spinner/Spinner";
import UserProfile from "components/UserProfile/UserProfile";
import apiGet from "lib/apiGet";
import { ContributionsPerMonth } from "models/ContributionsPerMonth";
import { ContributionsPerRepo } from "models/ContributionsPerRepo";
import { Language } from "models/Language";
import Repository from "models/Repository";
import User from "models/User";
import Router, { withRouter } from "next/router";
import "paper-dashboard-react/src/assets/scss/paper-dashboard.scss";
import React from "react";

interface UserPageState {
  user: User;
  repos: Repository[];
  contributionsPerMonth: ContributionsPerMonth[];
  contributionsPerRepo: ContributionsPerRepo[];
  languages: Map<Language, number>;
}

const defaultState = {
  user: null,
  repos: null,
  contributionsPerMonth: null,
  contributionsPerRepo: null,
  languages: null
};

class UserPage extends React.Component<any, UserPageState> {
  constructor(args) {
    super(args);
    this.state = defaultState;
  }

  public render() {
    const user = this.state.user;
    const repos = this.state.repos;
    const contributionsPerMonth = this.state.contributionsPerMonth;
    const contributionsPerRepo = this.state.contributionsPerRepo;
    const languages = this.state.languages;
    const userFullName = !!user ? user.name : "";
    const isDataPresent =
      !!user &&
      !!repos &&
      !!contributionsPerMonth &&
      !!contributionsPerRepo &&
      !!languages;

    return (
      <Page
        title={"GitHub stats of " + userFullName}
        description={`Some stats about ${userFullName}'s GitHub profile`}
      >
        {isDataPresent && (
          <FadeTransition>
            <SearchForm
              searchUser={username => {
                this.setState(defaultState);
                Router.push("/[username]", "/" + username);
              }}
            />
            <UserProfile user={user} repos={repos} />
            <ContributionsChart
              contributionsPerMonth={contributionsPerMonth}
              contributionsPerRepo={contributionsPerRepo}
            />
            <LanguagesCharts languages={languages} repos={repos} />
          </FadeTransition>
        )}
        {!isDataPresent && (
          <FadeTransition>
            <p className="h5">Fetching your data...</p>
            <Spinner />
          </FadeTransition>
        )}
      </Page>
    );
  }

  public componentDidMount() {
    const username = this.props.router.query.username;
    this.fetchAllData(username);
  }

  public componentDidUpdate(prevProps) {
    const username = this.props.router.query.username;
    // verify props have changed to avoid an infinite loop
    if (username !== prevProps.router.query.username) {
      this.fetchAllData(username);
    }
  }

  private fetchAllData(username) {
    apiGet<User>("/" + username).then(user => this.setState({ user }));
    apiGet<Repository[]>("/" + username + "/repos").then(repos =>
      this.setState({ repos })
    );
    apiGet<ContributionsPerMonth[]>("/" + username + "/timeline").then(
      contributionsPerMonth => this.setState({ contributionsPerMonth })
    );
    apiGet<ContributionsPerRepo[]>("/" + username + "/contributions").then(
      contributionsPerRepo => this.setState({ contributionsPerRepo })
    );
    apiGet("/" + username + "/languages").then((languages: any) =>
      this.setState({ languages: new Map(languages) })
    );
  }
}

export default withRouter(UserPage);
