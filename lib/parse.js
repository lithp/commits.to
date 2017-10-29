import chrono from 'chrono-node' // Sugar.js parses some things better

/* 
let test
//test = chrono.parseDate("foo the bar by sep 15th noon")
test = chrono.parseDate("Call_the_dentist by 2017-10-15 12pm")
console.log(`DEBUG: ${test} (unixtime = ${test.getTime()/1000}`)
console.log("DEBUG: ", JSON.stringify(parsePromise(promises[2])))
*/

// Take urtext and return a promise data structure
export default function parseprom(urtx) {
  // TODO: we should store a lowerCased version of urtx to use as the ID
  // to prevent creating 'duplicate' promises with capitalization differences
  // urtx = urtx.toLowerCase();
  
  // quick hack to remove trailing slashes
  // so both bob.commits.to and bob.commits.to/ show the full list of promises:
  urtx = urtx.replace(/\/$/, '')
  
  console.log(`DEBUG ${urtx}`)
  // Parse urtext into username, domain, and path -- username.commits.to/path
  // This version assumes no dots in usernames, so bob.really.commits.to would
  // parse as username "bob" and domain "really.commits.to":
  let m = urtx.match(/^([^\.]+)\.([^\.\/]+\.[^\/]+)\/?([^\?]*)(.*)$/)
  // TODO: handle the case that no user is given, just "promises.to/foo"
  console.log(`DEBUG PARSING: ${JSON.stringify(m)}`)
  let user   = m ? m[1] : ''
  let domain = m ? m[2] : ''
  let path   = m ? m[3] : ''
  let secret = m ? m[4] : ''
  // following should never happen -- we have a route for the empty promise case
  if (!path || path === '') { console.log(`ERROR: empty promise: ${urtx}`) }
  let what = ''
  let tdue = Date.now() + 7*24*60*60*1000
  if (path.length > 0) {
    let parsedPath = path.match(/^(.*?)(\/by\/|$)(.*)$/)
    
    tdue = parsedPath[3]
    // tdue = parseDate(parsedPath[3])
    what = replaceSeparatorWithSpaces(parsedPath[1])
    
    //tdue = parsedPath.length > 1 ? 
    //       chrono.parseDate(parsedPath[3].replace(/_/g, ' ')) * 1 : 
    //       Date.now() + 7*24*60*60*1000
    //tdue = tdue ? ( ( tdue < Date.now() && Date.now() - tdue < 24*60*60*1000 ) ?
    //                tdue + 24*60*60*1000 : tdue )
    //            : Date.now() + 7*24*60*60*1000
  }
  // TODO: path is now everything after ".promises.to" so now parse out the 
  //       "what" (thing being promised) and the "tdue" (deadline)
  urtx = urtx.replace(/\?(.*)=?(.*)$/, '')
  secret = secret.substr(2)
  
  console.log('parseProm', { user, secret, path, domain, what, tdue, urtx })
  
  return { user, secret, path, domain, what, tdue, urtx, tini: Date.now() }
}

function replaceSeparatorWithSpaces(string) {
  // TODO: (maybe) Escaping characters?
  var dash_regex = new RegExp('-', 'g');
  var underscore_regex = new RegExp('_', 'g');
  
  try {
    var dashes = string.match(dash_regex).length;
  } catch (e) {
    var dashes = 0;
  }
  try {
    var underscores = string.match(underscore_regex).length;
  } catch (e) {
    var underscores = 0;
  }

  if (dashes > underscores) {
    var separator = dash_regex;
  } else if (underscores > dashes) {
    var separator = underscore_regex;
  } else {
    return string;
  }

  return string.replace(separator, ' ');
}

function parseDate(string) {
  // TODO: user's timezone
  // TODO: unix time format for db
  if (string.length) {
    try {
      return chrono.parseDate(replaceSeparatorWithSpaces(string))
    } catch (e) {
    }
  }
  return chrono.parseDate('next week')
}


// TODO: Evaluate the usefulness of the function below for creating a "Add to Calendar" text button under a newly created promise  
//function buildAddToCalendarHTML(what,tdue) {
//  var googleCalendarHTML = '<a href="http://www.google.com/calendar/event?action=TEMPLATE&text=Your+IWill+Promise+to+';
//  googleCalendarHTML += what;
//  googleCalendarHTML += '+is+due';
//  googleCalendarHTML += '&dates=';
//  need to convert tdue to YYYYMMDDToHHMMSSZ/YYYYMMDDToHHMMSSZ (in Greenwich Mean Time with end time default to one hour after start time)
//  var convertedTdue = '';
//  googleCalendarHTML += convertedTdue;
//  googleCalendarHTML += '"';
//  googleCalendarHTML += ' target="_blank" rel="nofollow"';
//  googleCalendarHTML += '>Add to my calendar</a>';
//  return googleCalendarHTML;
//}
//Then perhaps use the returned HTML in a partials/button.handlebars file (not created yet) that only shows up upon initial creation of promise