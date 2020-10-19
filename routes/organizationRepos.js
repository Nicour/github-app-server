const express = require('express');
const router = express.Router();
const axios = require('axios');


router.get('/:organization', (req, res, next) => {
  try {
    const { organization } = req.params;

    axios.get(`https://api.github.com/orgs/${organization}/repos`)
    .then(response => {
      let listOfRepositories = [];
      response.data.forEach(element => {
        const repositoryMainInformation = {
          mostRecentActivity: element.updated_at,
          name: element.name,
          owner: element.owner.login,
          description: element.description
        };
        listOfRepositories.push(repositoryMainInformation);
      });

      listOfRepositories.sort((a,b) => {
        return new Date(b.mostRecentActivity) - new Date(a.mostRecentActivity);
      });

      if(!req.session.recentSearchedOrganizations) {
        req.session.recentSearchedOrganizations = [organization];
      } else {
        if(!req.session.recentSearchedOrganizations.includes(organization)) {
          req.session.recentSearchedOrganizations.push(organization);
        }
      }

      res.status(200).json({ 
        listOfRepositories: listOfRepositories,
      });
    })
    .catch(e => {
      res.status(404).send(e);
    });

  } catch (error) {
    next(error);
  }
});

router.get('/:owner/:repo', (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const contributors = [];
    axios.get(`https://api.github.com/repos/${owner}/${repo}`)
    .then(async (response) => {
      const repoDetails = {
        contributors: [],
        name: response.data.name,
        owner: response.data.owner.login,
        owner_url: response.data.owner.html_url,
        ownerAvatarUrl: response.data.owner.avatar_url,
        description: response.data.description,
        repoUrl: response.data.html_url
      };
      
      await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors`)
      .then(res => {
        res.data.forEach(element => {
          const contributor = {
            username: element.login,
            contributions: element.contributions
          };
          repoDetails.contributors.push(contributor);
        });
      })

      if(!req.session.recentSearchedRepos) {
        req.session.recentSearchedRepos = [{
          organization: owner, 
          name: repo
        }];
      } else {
        const found = req.session.recentSearchedRepos.some(element => element.name === repo);
        if (!found) {
          req.session.recentSearchedRepos.push({
            organization: owner, 
            name: repo
          });
        }
      }
      
      res.send(repoDetails);
    })
    .catch(e => {
      res.status(404).send(e);
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
