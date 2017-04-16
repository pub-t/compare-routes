const fs = require('fs');
const P = require('bluebird');
const _ = require('lodash');

function ReadFile(path) {
  let readFile = P.promisify(fs.readFile);
  return readFile(path, 'utf8');
}

P.join(ReadFile(process.argv[2]), ReadFile(process.argv[3]))
  .spread((osmRoutes, ap1Routes) => {
    let osmRoutesParse = JSON.parse(osmRoutes);
    let ap1RoutesParse = JSON.parse(ap1Routes);

    const filterRouters = _.filter(osmRoutesParse, osmRoute => {
      const osmRelation = _.compact(osmRoute.inner_routes.map(osm => osm.tags.name));
      const osmRelationReplace = osmRelation.map(osm =>
        osm.replace(/\(.*?\)|\[.*?]/g, "").replace(/\s/g, '').replace(/[—–-]/gim, '').toLowerCase());
      return _.find(ap1RoutesParse, ap1Route => {
        const routesKeys = Object.keys(ap1Route).map(relation => relation.replace(/\(.*?\)|\[.*?]/g, "")
          .replace(/\s/g, '').replace(/[—–-]/gim, '').toLowerCase());
        return _.isEqual(osmRelationReplace, routesKeys);
      })
    });
    console.log(filterRouters)
  });
