import _ from 'lodash';
import printMe from './print.js';
import './css/styles.css';

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!');
}


async function component() {
  var element = document.createElement('div');
  var btn = document.createElement('button');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  btn.innerHTML = 'Click me and check the console';
  btn.onclick = printMe;

  element.appendChild(btn);


  return element;
}

component().then(component => {
  document.body.appendChild(component);
});
/*
let element = component(); // store the element to re-render on print.js change
document.body.appendChild(element);

if (module.hot) {
	module.hot.accept('./print.js', function() {
		console.log('Accepting the updated printMe module!');
		document.body.removeChild(element);
    element = component(); // Re-render the "component" to update the click
    // handler
    document.body.appendChild(element);
	});
}
*/