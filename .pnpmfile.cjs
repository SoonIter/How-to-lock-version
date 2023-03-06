/*
treat react/package.json as this:
{
  "name": "react",
  "version": "18.2.0",
  "dependencies": {
    "loose-envify": "^1.1.0"
  },
  "peerDependencies": {
    "loose-envify": "^1.1.0"
  }
}

auto-install-peers=true
*/
function readPackage(pkg, context) {
  // if (pkg.name === 'react') {
  //   pkg.peerDependencies &&
  //     Object.assign(pkg.peerDependencies, {
  //       'loose-envify': '^1.1.0',
  //     });
  // } 

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
