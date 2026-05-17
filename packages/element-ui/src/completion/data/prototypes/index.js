import {arrayPrototypeCompletions} from './array-prototype';
import {datePrototypeCompletions} from './date-prototype';
import {elementPrototypeCompletions} from './element-prototype';
import {mapPrototypeCompletions} from './map-prototype';
import {numberPrototypeCompletions} from './number-prototype';
import {promisePrototypeCompletions} from './promise-prototype';
import {regexpPrototypeCompletions} from './regexp-prototype';
import {setPrototypeCompletions} from './set-prototype';
import {stringPrototypeCompletions} from './string-prototype';
import {nodeListPrototypeCompletions} from './node-list-prototype';
import {HTMLCollectionPrototypeCompletions} from './html-collection-prototype';

export const prototypeCompletions = {
    Array: arrayPrototypeCompletions,
    String: stringPrototypeCompletions,
    Number: numberPrototypeCompletions,
    Date: datePrototypeCompletions,
    RegExp: regexpPrototypeCompletions,
    Map: mapPrototypeCompletions,
    Set: setPrototypeCompletions,
    Promise: promisePrototypeCompletions,
    Element: elementPrototypeCompletions,
    NodeList: nodeListPrototypeCompletions,
    HTMLCollection: HTMLCollectionPrototypeCompletions,
};
