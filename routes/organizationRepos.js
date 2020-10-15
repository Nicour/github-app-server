const express = require('express');
const router = express.Router();
const axios = require('axios');


router.get('/:organization', async (req, res, next) => {
  try {
    const { organization } = req.params;

    axios.get(`https://api.github.com/orgs/${organization}/repos`)
    .then(response => {
      let listOfRepositories = [];
      response.data.forEach(element => {
        const formattedRepository = {
          mostRecentActivity: element.updated_at,
          name: element.name,
          owner: element.owner.login,
          description: element.description
        };
        listOfRepositories.push(formattedRepository);
      });

      listOfRepositories.sort((a,b) => {
        return new Date(b.mostRecentActivity) - new Date(a.mostRecentActivity);
      });

      if(!req.session.recentSearchedOrganizations) {
        req.session.recentSearchedOrganizations = [organization];
      } else {
        req.session.recentSearchedOrganizations.push(organization);
      }

      res.status(200).json({ 
        listOfRepositories: listOfRepositories,
      });
    })
    .catch(e => {
      res.send(e);
    });
    
  } catch (error) {
    next(error);
  }
});

router.get('/:organization/:repo', (req, res, next) => {
  try {
    const { organization, repo } = req.params;
    axios.get(`https://api.github.com/repos/${organization}/${repo}`)
    .then(response => {
      if(!req.session.recentSearchedRepos) {
        req.session.recentSearchedRepos = [{
          organization: organization, 
          repo: repo
        }];
      } else {
        req.session.recentSearchedRepos.push({
          organization: organization, 
          repo: repo
        });
      }
      res.send(response.data);
    })
    .catch(e => {
      res.send(e);
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
