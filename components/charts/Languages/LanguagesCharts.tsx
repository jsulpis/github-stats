import { Language } from "models/Language";
import Repository from "models/Repository";
import React from "react";
import { Card, CardBody, CardHeader, CardTitle } from "reactstrap";
import HorizontalBarChart from "../BarCharts/HorizontalBarsChart";
import { ChartData } from "../chart.models";
import "./LanguagesCharts.scss";

interface LanguagesChartsProps {
  languages: Map<Language, number>;
  repos: Repository[];
}

function LanguagesCharts(props: LanguagesChartsProps) {
  const { languages, repos } = props;
  const displayLanguagesCodeAmount = !!languages && languages.size > 0;
  const displayLanguagesByRepos = !!repos && repos.length > 0;

  return (
    <Card className="card-user">
      <CardHeader>
        <CardTitle tag="h5">Languages</CardTitle>
      </CardHeader>
      <CardBody>
        <div className="languages-charts">
          {displayLanguagesCodeAmount && (
            <LanguagesByCodeAmountChart languages={languages} />
          )}
          {displayLanguagesByRepos && <LanguagesByReposChart repos={repos} />}
        </div>
      </CardBody>
    </Card>
  );
}

function LanguagesByCodeAmountChart(props: {
  languages: Map<Language, number>;
}) {
  const languagesByAmountOfCode: ChartData[] = makeChartDataFromLanguages(
    props.languages
  );

  const codeLanguagesMessage =
    props.languages.size > 6
      ? "6 most used languages, by amount of code"
      : "By amount of code";

  return (
    <div>
      <h5 className="chart-subtitle code-languages">{codeLanguagesMessage}</h5>
      <HorizontalBarChart
        data={languagesByAmountOfCode.slice(0, 6)}
        unit="Bytes of code"
      />
    </div>
  );
}

function LanguagesByReposChart(props: { repos: Repository[] }) {
  const languagesByNumberOfRepos: ChartData[] = makeChartDataFromLanguages(
    countReposPerLanguage(props.repos)
  );

  const repoLanguagesMessage =
    languagesByNumberOfRepos.length > 6
      ? "6 most used languages, by number of repos"
      : "By number of repos";

  return (
    <div>
      <h5 className="chart-subtitle repo-languages">{repoLanguagesMessage}</h5>
      <HorizontalBarChart
        data={languagesByNumberOfRepos.slice(0, 6)}
        unit="Repos"
      />
    </div>
  );
}

function makeChartDataFromLanguages(
  languages: Map<Language, number>
): ChartData[] {
  return [...languages.entries()]
    .map(([language, totalSize]) => {
      return {
        label: language.name,
        value: totalSize,
        color: language.color || ""
      };
    })
    .sort((lang1, lang2) => lang2.value - lang1.value);
}

function countReposPerLanguage(repos: Repository[]): Map<Language, number> {
  const languagesMap = new Map<string, number>(); // I use string keys to fake shallow keys equality
  for (const repo of repos) {
    const repoLanguage = JSON.stringify({
      name: repo.primaryLanguage ? repo.primaryLanguage.name : "None",
      color: repo.primaryLanguage ? repo.primaryLanguage.color : ""
    }); // workaround to use string keys instead of objects
    const currentLanguageSize = languagesMap.get(repoLanguage) || 0;
    languagesMap.set(repoLanguage, currentLanguageSize + 1);
  }
  // back to Language objects
  return new Map<Language, number>(
    [...languagesMap.entries()].map(([langToString, size]) => [
      JSON.parse(langToString),
      size
    ])
  );
}

export default LanguagesCharts;
