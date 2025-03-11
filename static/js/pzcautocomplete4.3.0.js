// -------------- Quelle: http://www.javascript-examples.com/content/autocomplete/phpguru/phpguru-autocomplete.zip -----//
/**
* This library is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this library; if not, write to the Free Software
* Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
* 
* © Copyright 2005 Richard Heyes
*/


/** Selektoren */
var SelektorPZCEingabebox = "#pzceingabebox";
var KlasseNurCodeEingabe = "NurCodeingabe";
var PZCListeInputSelektor = "input[name='PZCs[]']";
var SelektorPZCEingabeboxFormular = SelektorPZCEingabebox + " form";
var SelektorPZCInputText = "#pzcinput";
var SelektorNebenPZCAktivCheck = "input[name='NebenPZCAktiv']"; // ob der Neben-PZC global aktiv ist
var SelektorNebenPZCWirdEingegeben = "input[name='NebenPZCEingabe']";
var SelektorPZCEingabeAbbrechen = SelektorPZCEingabebox + " .abbrechen";
var NebenPZCCodeLaenge = 3; // Codeanteil

/* Selektoren fuer die Filter mit Sonderbehandlung */
var SelektorPZCErweitertIntensivpflichtig = "input[name='filter-230']";
var SelektorPZCErweitertReanimiert = "input[name='filter-220']";
var SelektorPZCErweitertBeatmet = "input[name='filter-210']";
var SelektorPZCErweitertAnsteckungsfaehig = "input[name='filter-240']";
var SelektorPZCErweitertSchockraum = "input[name='filter-40']";
var SelektorPZCErweitertHerzkatheter = "input[name='filter-50']";
var SelektorPZCErweitertArbeitsunfall = "input[name='filter-60']";
var SelektorPZCErweitertSchwanger = "input[name='filter-70']";
var SelektorPZCErweitertFreiheitsentzug = "input[name='filter-75']";
var AutocompleteItemContainerSelector = ".autocomplete";

var pzc_data_array = new Array();
__PZCAutoComplete = new Array();
var PZCAutoCompleteIDListe =  new Array();
var toDisplay = new Array();
var timer_refresh_blocked_pzc;

// Basic UA detection
isIE = document.all ? true : false;
isGecko = navigator.userAgent.toLowerCase().indexOf('gecko') != -1;
isOpera = navigator.userAgent.toLowerCase().indexOf('opera') != -1;

var PZCFilterContainerSelector = "#pzc-erweitert";
var PZCFilterCheckboxSelector = PZCFilterContainerSelector + " input[type='checkbox']";
var BDContainerSelektor = ".pzc-erweitert-bd-container";
var BDnContainerSelektor = "#pzc-erweitert-bd-"; // +BD-ID
var BDIdSelektor = "input[name='pzc-erweitert-bd-id']";
var FilterAktivKlasse = "filter-aktiv-label";



/**
 * Vergibt die aktive Klasse um die Label
 * @returns {undefined}
 */
function UpdateLabelCSS() {
 jQuery(PZCFilterCheckboxSelector).each( function() {
  var IstSelektiert = jQuery(this).is(":checked");
  jQuery(this).parents("label").toggleClass(FilterAktivKlasse, IstSelektiert);
 });
}

/**
 * Sonderbehandlung fuer Intensivpflichtig, Reanimiert, Beatmet
 * @param {type} e Event
 * @returns {undefined}
 */
function PZCFilterZustaende(e) {
 var Zielelement = jQuery(e.target);
 var ZielelementContainer = Zielelement.closest(BDContainerSelektor);
 var BDSelektiert = parseInt(ZielelementContainer.children(BDIdSelektor).first().val());
 var ZustandSelektiert = Zielelement.is(":checked");
 var ZustandDisabled = Zielelement.is(":disabled");
 if (ZustandDisabled) {
  return; // darf nicht veraendert werden!
 }
 var ZustaendeSelektiert = {}; // Vorsicht: Name der Property analog zum Variablennamen oben (nicht identisch)
 var ZustaendeDisabled = {}; // Vorsicht: Name der Property analog zum Variablennamen oben (nicht identisch)
 
 // Disabled initialisieren
 ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig = false;
 ZustaendeDisabled.SelektorPZCErweitertReanimiert = false;
 ZustaendeDisabled.SelektorPZCErweitertBeatmet = false;
 ZustaendeDisabled.SelektorPZCErweitertAnsteckungsfaehig = false;
 ZustaendeDisabled.SelektorPZCErweitertSchockraum = false;
 ZustaendeDisabled.SelektorPZCErweitertHerzkatheter = false;
 ZustaendeDisabled.SelektorPZCErweitertArbeitsunfall = false;
 ZustaendeDisabled.SelektorPZCErweitertSchwanger = false;
 ZustaendeDisabled.SelektorPZCErweitertFreiheitsentzug = false;
 
 // BD 1:
 // 0: Intensivpflichtig checked intensivpflichtig, disabled 1 und 2 (Reanimiert und Beatmet)
 // 1: Reanimiert checked reanimiert und beatmet, disabled beatmet, disabled intensivpflichtig
 // 2: Beatmet checked beatmet, disabled intensivpflichtig
 
 // BD 2:
 // 1: Reanimiert disabled
 // 4: Schockraum disabled
 // 5: HK disabled
 
 // BD 3:
 // 0, 1, 2, 4, 5 disabled
 
 // Zielelement gegen die Selektoren testen
 if (Zielelement.is(SelektorPZCErweitertIntensivpflichtig)) { // Sonderbehandlung Intensivpflichtig
  if (ZustandSelektiert) {
   ZustaendeDisabled.SelektorPZCErweitertReanimiert = true;
   ZustaendeDisabled.SelektorPZCErweitertBeatmet = true;
   ZustaendeSelektiert.SelektorPZCErweitertReanimiert = false;
   ZustaendeSelektiert.SelektorPZCErweitertBeatmet = false;
  } else {
   ZustaendeDisabled.SelektorPZCErweitertReanimiert = false;
   ZustaendeDisabled.SelektorPZCErweitertBeatmet = false;
   ZustaendeSelektiert.SelektorPZCErweitertReanimiert = false;
   ZustaendeSelektiert.SelektorPZCErweitertBeatmet = false;
  }
 } else if (Zielelement.is(SelektorPZCErweitertReanimiert)) { // Sonderbehandlung Reanimiert
  if (ZustandSelektiert) {
   ZustaendeSelektiert.SelektorPZCErweitertReanimiert = true;
   ZustaendeSelektiert.SelektorPZCErweitertBeatmet = true;
   ZustaendeDisabled.SelektorPZCErweitertBeatmet = true; // disabled beatmet!
   ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig = true;
  } else {
   ZustaendeSelektiert.SelektorPZCErweitertReanimiert = false;
   ZustaendeSelektiert.SelektorPZCErweitertBeatmet = false;
   ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig = false;
   ZustaendeDisabled.SelektorPZCErweitertBeatmet = false;
  }
 } else if (Zielelement.is(SelektorPZCErweitertBeatmet)) { // Sonderbehandlung Beatmet
  if (ZustandSelektiert) { // nur wenn Reanimation nicht selektiert ist!
   ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig = true;
   ZustaendeSelektiert.SelektorPZCErweitertIntensivpflichtig = false;
  } else {
   ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig = false;
  }
 } else {
  // keine Sonderbehandlung
 }
 
 // Disabled immer in Abhaengigkeit von BD!
 if (BDSelektiert === 1) {
  ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig = (false || ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig);
  ZustaendeDisabled.SelektorPZCErweitertReanimiert = (false || ZustaendeDisabled.SelektorPZCErweitertReanimiert);
  ZustaendeDisabled.SelektorPZCErweitertBeatmet = (false || ZustaendeDisabled.SelektorPZCErweitertBeatmet);
  ZustaendeDisabled.SelektorPZCErweitertSchockraum = (false || ZustaendeDisabled.SelektorPZCErweitertSchockraum);
  ZustaendeDisabled.SelektorPZCErweitertHerzkatheter = (false || ZustaendeDisabled.SelektorPZCErweitertHerzkatheter);
 }
 else if (BDSelektiert === 2) {
  ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig = (false || ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig);
  ZustaendeDisabled.SelektorPZCErweitertReanimiert = true; // immer!
  ZustaendeDisabled.SelektorPZCErweitertBeatmet = (false || ZustaendeDisabled.SelektorPZCErweitertBeatmet);
  ZustaendeDisabled.SelektorPZCErweitertSchockraum = true; // immer!
  ZustaendeDisabled.SelektorPZCErweitertHerzkatheter = true; // immer!
 }
 else if (BDSelektiert === 3) {
  ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig = true; // immer
  ZustaendeDisabled.SelektorPZCErweitertReanimiert = true; // immer
  ZustaendeDisabled.SelektorPZCErweitertBeatmet = true; // immer
  ZustaendeDisabled.SelektorPZCErweitertSchockraum = true; // immer
  ZustaendeDisabled.SelektorPZCErweitertHerzkatheter = true; // immer
 }
 
 // Selektiert setzen (alle)
 ZustaendeSelektiert.SelektorPZCErweitertIntensivpflichtig = (ZustaendeSelektiert.SelektorPZCErweitertIntensivpflichtig && !ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig);
 ZustaendeSelektiert.SelektorPZCErweitertReanimiert = (ZustaendeSelektiert.SelektorPZCErweitertReanimiert && !ZustaendeDisabled.SelektorPZCErweitertReanimiert);
 // ZustaendeSelektiert.SelektorPZCErweitertBeatmet = (ZustaendeSelektiert.SelektorPZCErweitertBeatmet && !ZustaendeDisabled.SelektorPZCErweitertBeatmet);
 ZustaendeSelektiert.SelektorPZCErweitertAnsteckungsfaehig = (ZustaendeSelektiert.SelektorPZCErweitertAnsteckungsfaehig && !ZustaendeDisabled.SelektorPZCErweitertAnsteckungsfaehig);
 ZustaendeSelektiert.SelektorPZCErweitertSchockraum = (ZustaendeSelektiert.SelektorPZCErweitertSchockraum && !ZustaendeDisabled.SelektorPZCErweitertSchockraum);
 ZustaendeSelektiert.SelektorPZCErweitertHerzkatheter = (ZustaendeSelektiert.SelektorPZCErweitertHerzkatheter && !ZustaendeDisabled.SelektorPZCErweitertHerzkatheter);
 ZustaendeSelektiert.SelektorPZCErweitertArbeitsunfall = (ZustaendeSelektiert.SelektorPZCErweitertArbeitsunfall && !ZustaendeDisabled.SelektorPZCErweitertArbeitsunfall);
 ZustaendeSelektiert.SelektorPZCErweitertSchwanger = (ZustaendeSelektiert.SelektorPZCErweitertSchwanger && !ZustaendeDisabled.SelektorPZCErweitertSchwanger);
 ZustaendeSelektiert.SelektorPZCErweitertFreiheitsentzug = (ZustaendeSelektiert.SelektorPZCErweitertFreiheitsentzug && !ZustaendeDisabled.SelektorPZCErweitertFreiheitsentzug);
 
 // Zustaende setzen...
 ZielelementContainer.find(SelektorPZCErweitertIntensivpflichtig).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertIntensivpflichtig )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertIntensivpflichtig );
 
 ZielelementContainer.find(SelektorPZCErweitertReanimiert).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertReanimiert )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertReanimiert );
 
 ZielelementContainer.find(SelektorPZCErweitertBeatmet).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertBeatmet )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertBeatmet );
 
 ZielelementContainer.find(SelektorPZCErweitertAnsteckungsfaehig).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertAnsteckungsfaehig )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertAnsteckungsfaehig );
 
 ZielelementContainer.find(SelektorPZCErweitertSchockraum).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertSchockraum )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertSchockraum );
 
 ZielelementContainer.find(SelektorPZCErweitertHerzkatheter).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertHerzkatheter )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertHerzkatheter );
 
 ZielelementContainer.find(SelektorPZCErweitertArbeitsunfall).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertArbeitsunfall )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertArbeitsunfall );
 
 ZielelementContainer.find(SelektorPZCErweitertSchwanger).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertSchwanger )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertSchwanger );
 
 ZielelementContainer.find(SelektorPZCErweitertFreiheitsentzug).first()
  .prop( "checked", ZustaendeSelektiert.SelektorPZCErweitertFreiheitsentzug )
  .prop( "disabled", ZustaendeDisabled.SelektorPZCErweitertFreiheitsentzug );
 
 UpdateLabelCSS();
}

/**
* Attachs the autocomplete object to a form element. Sets
* onkeypress event on the form element.
* 
* @param string formElement Name of form element to attach to
* @param array  data        Array of strings of which to use as the autocomplete data
*/
function PZCAutoComplete_Create (id, data) {
 var PZCDOMElement = document.getElementById(id);
 if (!PZCDOMElement) {
  return false;
 }
 __PZCAutoComplete[id] = {
  'data': data,
  'isVisible': false,
  'element': PZCDOMElement,
  'dropdown': null,
  'highlighted': null
 };

  __PZCAutoComplete[id]['element'].setAttribute('autocomplete', 'off');
  __PZCAutoComplete[id]['element'].onkeydown  = function(e) {return PZCAutoComplete_KeyDown(this.getAttribute('id'), e);}
  __PZCAutoComplete[id]['element'].onkeyup    = function(e) {return PZCAutoComplete_KeyUp(this.getAttribute('id'), e);}
  __PZCAutoComplete[id]['element'].onkeypress = function(e) {if (!e) e = window.event; if (e.keyCode == 13 || isOpera) return false;}
  __PZCAutoComplete[id]['element'].ondblclick = function($event) {PZCAutoComplete_ShowDropdown(this.getAttribute('id'), true, $event);}
  __PZCAutoComplete[id]['element'].onclick    = function($event) {PZCAutoComplete_ShowDropdown(this.getAttribute('id'), true, $event);} //function(e) {if (!e) e = window.event; e.cancelBubble = true; e.returnValue = false;}

  PZCAutoCompleteIDListe.push(id);

  // Event-Handler für Click-Event
  var docClick = function($event) {
   if (!$event) {
    $event = window.event;
   }

   // nur wenn die auswahlbox oder ein dropdownelement gewaehlt wurde
   var checkClick = false; // soll dieses Event ausgewertet werden
   var ZielElement = jQuery($event.target);
   
   var NebenPZCWirdEingegeben = jQuery(SelektorNebenPZCWirdEingegeben).val();

   // Erweiterte PZC-Kriterien
   if (ZielElement.parents(PZCFilterContainerSelector).length > 0) { // es wurde irgendwo im Bereich erweiterte Filter geklickt
    checkClick = true;
   }

   // alte Variante (wenn bisher nichts gefunden wurde)...
   if (!checkClick) {
    for(var k = 0; k < PZCAutoCompleteIDListe.length; k++) {
     var pzcinputid = PZCAutoCompleteIDListe[k];

     if (($event.target || $event.srcElement).id == pzcinputid) {
      checkClick = true;
      break;
     }

     var anzahlchildnodes = __PZCAutoComplete[pzcinputid]['dropdown'].childNodes.length;
     for (var i = 0; i < anzahlchildnodes; ++i) {
      if (__PZCAutoComplete[pzcinputid]['dropdown'].childNodes[i].className == "autocomplete_item" || __PZCAutoComplete[pzcinputid]['dropdown'].childNodes[i].className == "autocomplete_item_highlighted") {
       var test1 = ($event.target || $event.srcElement).id;
       var test2 = __PZCAutoComplete[pzcinputid]['dropdown'].childNodes[i].id;
       if(test1 == test2) {
        checkClick = true;
        break;
       }
      }
     }
    }
   }

   if(checkClick === true) {
    for(var k=0; k<PZCAutoCompleteIDListe.length; k++) {
     var pzcinputid = PZCAutoCompleteIDListe[k];

     var index = __PZCAutoComplete[pzcinputid]['highlighted'];
     if(!isNaN(index)) {
       if(toDisplay[index]) {
         if(toDisplay[index].auswaehlbar == 0) {
           break; // Dieser PZC kann nicht ausgewählt werden
         }
       }
     }

    PZCAutoComplete_SetValue(pzcinputid);
    
    if (NebenPZCWirdEingegeben) { /** autocompleter schliessen sonst gibt es probleme mit dem klick */
     var NebenPZCLaenge = __PZCAutoComplete[pzcinputid]['element'].value.length;
     if (NebenPZCLaenge >= NebenPZCCodeLaenge) {
      /* PZCAutoComplete_HideDropdown(pzcinputid); */
      PZCAutoComplete_ShowDropdown(pzcinputid, false, $event);
     }
    }

    var inputelement = __PZCAutoComplete[pzcinputid]['element'];
    var inputelementval = __PZCAutoComplete[pzcinputid]['element'].value;

     if(inputelementval.length === 3 && isIE) {
      var inputRange = inputelement.createTextRange();
      inputRange.moveStart ("character", 3);
      inputRange.collapse ();
      inputRange.moveEnd ("character", 3);
      inputRange.select ();
     }
     inputelement.focus();
    }
   } else { // alle autocompleter schliessen
    for(var k = 0; k < PZCAutoCompleteIDListe.length; k++) {
      var pzcinputid = PZCAutoCompleteIDListe[k];
      PZCAutoComplete_HideDropdown(pzcinputid, $event);
    }
   }
  }; // docClick

  // Event binden
  jQuery(document).on("click", docClick); // Clickhandler für PZC-Autocomplete
  jQuery(document).on("change", PZCFilterCheckboxSelector, function(e) { // Change-Event für Checkboxen erweiterte PZC-Filter (zum Bearbeiten der Zustaende)
   PZCFilterZustaende(e);
   return true;
  });
   
  // Max number of items shown at once
  if (arguments[2] != null) {
   __PZCAutoComplete[id]['maxitems'] = arguments[2];
   __PZCAutoComplete[id]['firstItemShowing'] = 0;
   __PZCAutoComplete[id]['lastItemShowing']  = arguments[2] - 1;
  }

  PZCAutoComplete_CreateDropdown(id);

  // Prevent select dropdowns showing thru
  if (isIE) {
   __PZCAutoComplete[id]['iframe'] = document.createElement('iframe');
   __PZCAutoComplete[id]['iframe'].id = id +'_iframe';
   __PZCAutoComplete[id]['iframe'].style.position = 'absolute';
   __PZCAutoComplete[id]['iframe'].style.top = '0';
   __PZCAutoComplete[id]['iframe'].style.left = '0';
   __PZCAutoComplete[id]['iframe'].style.width = '0px';
   __PZCAutoComplete[id]['iframe'].style.height = '0px';
   __PZCAutoComplete[id]['iframe'].style.zIndex = '98';
   __PZCAutoComplete[id]['iframe'].style.visibility = 'hidden';

   __PZCAutoComplete[id]['element'].parentNode.insertBefore(__PZCAutoComplete[id]['iframe'], __PZCAutoComplete[id]['element']);
  }

 if(pzc_filter_aktiv == 1) {
  addIVENAListener('keyup', document.getElementById('pzcinput'), function (e) {
   e = e || window.event;
   pzcerweiterung(document.getElementById('pzcinput'), e);
  });
 }
 
 // Ausrichtung des Dropdowns exakt vornehmen
 jQuery(AutocompleteItemContainerSelector).position({
   of: jQuery(SelektorPZCEingabebox),
   my: "right top",
   at: "right bottom",
   collision: "none"
 });
}


/**
* Creates the dropdown layer
* 
* @param string id The form elements id. Used to identify the correct dropdown.
*/
function PZCAutoComplete_CreateDropdown(id) {
 var width = 240;    
 __PZCAutoComplete[id]['dropdown'] = document.createElement('div');
 __PZCAutoComplete[id]['dropdown'].className = 'autocomplete';
 __PZCAutoComplete[id]['element'].parentNode.insertBefore(__PZCAutoComplete[id]['dropdown'], __PZCAutoComplete[id]['element']);

 __PZCAutoComplete[id]['dropdown'].style.width = width + 'px';
 __PZCAutoComplete[id]['dropdown'].style.zIndex = '99';
 __PZCAutoComplete[id]['dropdown'].style.visibility = 'hidden';
}

/**
 * 
 * @returns {undefined}
 */
function unblock () {
 refresh_blocked_pzc = 0;
 window.clearTimeout(timer_refresh_blocked_pzc);
}

/**
 * Shows the dropdown layer
 * @param {string} id The form elements id. Used to identify the correct dropdown.
 * @param {bool} spezialtaste
 * @returns {undefined}
 */
function PZCAutoComplete_ShowDropdown(id, spezialtaste, $event) {
 PZCAutoComplete_HideAll($event);

 var value = __PZCAutoComplete[id]['element'].value;
 toDisplay = new Array();
 var newDiv = null;
 var text = null;
 var numItems = __PZCAutoComplete[id]['dropdown'].childNodes.length;

 if (value.length > 0) {
  window.clearTimeout(timer_refresh_blocked_pzc);
  refresh_blocked_pzc = 1;
  timer_refresh_blocked_pzc = window.setTimeout(unblock, 30000);
 } else {
  refresh_blocked_pzc = 0;
  window.clearTimeout(timer_refresh_blocked_pzc);
 } 
 // Wenn im Eingabefeld <= 2 Zeichen stehen, wird der 1. Hinweis angezeigt
 PZCBoxLabelUmschalten(value.length);

 // Remove all child nodes from dropdown
 while (__PZCAutoComplete[id]['dropdown'].childNodes.length > 0) {
  __PZCAutoComplete[id]['dropdown'].removeChild(__PZCAutoComplete[id]['dropdown'].childNodes[0]);
 }

// Die Drop-Down-Box soll nur erscheinen, wenn die ersten 3 Stellen (also der PZC) eingegeben werden
if ((value.length > 0 && value.length <= 3) || (spezialtaste === true && value.length <= 3)) {
 // Go thru data searching for matches
 for (i = 0; i < __PZCAutoComplete[id]['data'].length; ++i) {
  if (__PZCAutoComplete[id]['data'][i].text.substr(0, value.length) == value) {
   toDisplay[toDisplay.length] = __PZCAutoComplete[id]['data'][i];
  }
 }

 // No matches?
 if (toDisplay.length === 0) {
  PZCAutoComplete_HideDropdown(id);
  return;
 }

 // Domnode Zusammenbauen
 for (i=0; i < toDisplay.length; ++i) {
  newDiv = document.createElement("div");
  newDiv.className = "autocomplete_item";
  newDiv.setAttribute('index', i);
  newDiv.style.zIndex = '99';

  if(toDisplay[i].auswaehlbar == 0) {
   newDiv.style.backgroundColor = '#cccccc';
  }

  newDiv.style.width = 200;
  newDiv.onmouseover = function() { PZCAutoComplete_HighlightItem(__PZCAutoComplete[id]['element'].getAttribute('id'), this.getAttribute('index')); };
  newDiv.onClick     = function() { PZCAutoComplete_SetValue(__PZCAutoComplete[id]['element'].getAttribute('id')); PZCAutoComplete_HideDropdown(__PZCAutoComplete[id]['element'].getAttribute('id'));__PZCAutoComplete[id]['element'].focus(); };

  text = document.createTextNode(toDisplay[i].text);
  
  // Container um beides...
  var PZCContainerDOMElement = document.createElement("div");
  PZCContainerDOMElement.className = "pzc-liste-element-container";
  
  // Code
  var PZCCodeContainerDOMElement = document.createElement("span");
  PZCCodeContainerDOMElement.className = "pzc-code";
  var PZCCodeDOMElement = document. createTextNode(toDisplay[i].code);
  PZCCodeContainerDOMElement.appendChild(PZCCodeDOMElement);
  
  // Name
  var PZCNameContainerDOMElement = document.createElement("span");
  PZCNameContainerDOMElement.className = "pzc-name";
  var PZCNameDOMElement = document. createTextNode(toDisplay[i].pzc_name);
  PZCNameContainerDOMElement.appendChild(PZCNameDOMElement);
  
  var PZCContainerLegacyDOMElement = document.createElement("div");
  PZCContainerLegacyDOMElement.className = "pzc-liste-element-container-legacy";
  
  
  PZCContainerLegacyDOMElement.appendChild(text);
  newDiv.appendChild(PZCContainerLegacyDOMElement);
  
  PZCContainerDOMElement.appendChild(PZCCodeContainerDOMElement);
  PZCContainerDOMElement.appendChild(PZCNameContainerDOMElement);
  newDiv.appendChild(PZCContainerDOMElement);
  

  __PZCAutoComplete[id]['dropdown'].appendChild(newDiv);
 }

  // zu viele Elemente
  if (toDisplay.length > __PZCAutoComplete[id]['maxitems']) {
   __PZCAutoComplete[id]['dropdown'].style.height = (__PZCAutoComplete[id]['maxitems'] * 15) + 2 + 'px';
  } else {
   __PZCAutoComplete[id]['dropdown'].style.height = '';
  }
  
  // Dropdown anzeigen
  if (!__PZCAutoComplete[id]['isVisible']) {
   __PZCAutoComplete[id]['dropdown'].style.visibility = 'visible';
   __PZCAutoComplete[id]['isVisible'] = true;

   jQuery(AutocompleteItemContainerSelector).position({
    of: jQuery(SelektorPZCEingabebox),
    my: "right top",
    at: "right bottom",
    collision: "none"
   });
  }

  // If now showing less items than before, reset the highlighted value
  if (__PZCAutoComplete[id]['dropdown'].childNodes.length != numItems) {
   __PZCAutoComplete[id]['highlighted'] = null;
  }
 } // Ende der Abfrage, ob schon mehr als 3 stellen (also mehr als der PZC) eingegeben wurden
}


/**
* Hides the dropdown layer
* 
* @param string id The form elements id. Used to identify the correct dropdown.
*/
function PZCAutoComplete_HideDropdown(id, $event) {
 if (__PZCAutoComplete[id]['iframe'])
 {
  __PZCAutoComplete[id]['iframe'].style.visibility = 'hidden';
 }

 __PZCAutoComplete[id]['dropdown'].style.visibility = 'hidden';
 __PZCAutoComplete[id]['highlighted'] = null;
 __PZCAutoComplete[id]['isVisible']   = false;
 
	var $HTML_PZCErweitert = "#pzc-erweitert";
	var $ClickIstInnerhalbDesContainers = 0;
	// Prüfen, ob der Klick innerhalb des Kriterium-Fensters erfolgt. Wenn ja, 
	// dann darf das Fenster nicht versteckt werden!
	if( "undefined" !== typeof($event) )
	{
		$ClickIstInnerhalbDesContainers = jQuery($event.target).closest($HTML_PZCErweitert).length;
	}
	if( 0 === $ClickIstInnerhalbDesContainers )
	{
		jQuery($HTML_PZCErweitert).css("display", "none");
	}
}

/**
* Hides all dropdowns
*/
function PZCAutoComplete_HideAll( $event ) {
 for(var k = 0; k < PZCAutoCompleteIDListe.length; k++) {
  var pzcinputid = PZCAutoCompleteIDListe[k];
  PZCAutoComplete_HideDropdown(pzcinputid, $event);
 }
}

/**
* Highlights a specific item
* 
* @param string id    The form elements id. Used to identify the correct dropdown.
* @param int    index The index of the element in the dropdown to highlight
*/
function PZCAutoComplete_HighlightItem(id, index) {
 if (__PZCAutoComplete[id]['dropdown'].childNodes[index]) {
  for (var i=0; i<__PZCAutoComplete[id]['dropdown'].childNodes.length; ++i) {
   if (__PZCAutoComplete[id]['dropdown'].childNodes[i].className == 'autocomplete_item_highlighted') {
       __PZCAutoComplete[id]['dropdown'].childNodes[i].className = 'autocomplete_item';
   }
  }

  __PZCAutoComplete[id]['dropdown'].childNodes[index].className = 'autocomplete_item_highlighted';
  __PZCAutoComplete[id]['highlighted'] = index;
 }
}


/**
* Highlights the menu item with the given index
* 
* @param string id    The form elements id. Used to identify the correct dropdown.
* @param int    index The index of the element in the dropdown to highlight
*/
function PZCAutoComplete_Highlight(id, index) {
    // Out of bounds checking
    if (index == 1 && __PZCAutoComplete[id]['highlighted'] == __PZCAutoComplete[id]['dropdown'].childNodes.length - 1) {
        __PZCAutoComplete[id]['dropdown'].childNodes[__PZCAutoComplete[id]['highlighted']].className = 'autocomplete_item';
        __PZCAutoComplete[id]['highlighted'] = null;

    } else if (index == -1 && __PZCAutoComplete[id]['highlighted'] == 0) {
        __PZCAutoComplete[id]['dropdown'].childNodes[0].className = 'autocomplete_item';
        __PZCAutoComplete[id]['highlighted'] = __PZCAutoComplete[id]['dropdown'].childNodes.length;
    }

    // Nothing highlighted at the moment
    if (__PZCAutoComplete[id]['highlighted'] == null) {
        if(__PZCAutoComplete[id]['dropdown'].childNodes[0])
        {
                __PZCAutoComplete[id]['dropdown'].childNodes[0].className = 'autocomplete_item_highlighted';
        }
        __PZCAutoComplete[id]['highlighted'] = 0;

    } else {
        if (__PZCAutoComplete[id]['dropdown'].childNodes[__PZCAutoComplete[id]['highlighted']]) {
            __PZCAutoComplete[id]['dropdown'].childNodes[__PZCAutoComplete[id]['highlighted']].className = 'autocomplete_item';
        }

        var newIndex = __PZCAutoComplete[id]['highlighted'] + index;

        if (__PZCAutoComplete[id]['dropdown'].childNodes[newIndex]) {
            __PZCAutoComplete[id]['dropdown'].childNodes[newIndex].className = 'autocomplete_item_highlighted';

            __PZCAutoComplete[id]['highlighted'] = newIndex;
        }
    }
}

function PZCBoxLabelUmschalten(PZCBoxWertLaenge) {
 var IstNurCodeeingabe = jQuery(SelektorPZCEingabebox).hasClass(KlasseNurCodeEingabe);
 
 if (IstNurCodeeingabe) { // immer nur den Code anzeigen...
  document.getElementById('pzc_hinweis_diagnose').style.display = 'inline-block';
  document.getElementById('pzc_hinweis_alter').style.display = 'none';
  document.getElementById('pzc_hinweis_bd').style.display = 'none';
 } else { // alte Logik
  if (PZCBoxWertLaenge <= 2) {
   document.getElementById('pzc_hinweis_diagnose').style.display = 'inline-block';
   document.getElementById('pzc_hinweis_alter').style.display = 'none';
   document.getElementById('pzc_hinweis_bd').style.display = 'none';
  } else if (PZCBoxWertLaenge <= 4) {
   document.getElementById('pzc_hinweis_diagnose').style.display = 'none';
   document.getElementById('pzc_hinweis_alter').style.display = 'inline-block';
   document.getElementById('pzc_hinweis_bd').style.display = 'none';
  } else {
   document.getElementById('pzc_hinweis_diagnose').style.display = 'none';
   document.getElementById('pzc_hinweis_alter').style.display = 'none';
   document.getElementById('pzc_hinweis_bd').style.display = 'inline-block';
  }
 }
}

/**
* Sets the input to a given value
* 
* @param string id The form elements id. Used to identify the correct dropdown.
*/
function PZCAutoComplete_SetValue(id) {
 if(__PZCAutoComplete[id]['dropdown'].childNodes[__PZCAutoComplete[id]['highlighted']]) {
   __PZCAutoComplete[id]['element'].value = __PZCAutoComplete[id]['dropdown'].childNodes[__PZCAutoComplete[id]['highlighted']].textContent.substr(0,3);
 }

 PZCBoxLabelUmschalten(__PZCAutoComplete[id]['element'].value.length);
}

/**
* Checks if the dropdown needs scrolling
* 
* @param {type} id The form elements id. Used to identify the correct dropdown. 
*/
function PZCAutoComplete_ScrollCheck(id) {
 var ScrollTopContainer = jQuery(SelektorPZCEingabebox + " .autocomplete").scrollTop();
 // unter __PZCAutoComplete[id]['highlighted'] steht der Index :)
 var IndexHighlighted = __PZCAutoComplete[id]['highlighted'];
 // Scroll down, or wrapping around from scroll up
 if (__PZCAutoComplete[id]['highlighted'] > __PZCAutoComplete[id]['lastItemShowing']) {
     __PZCAutoComplete[id]['firstItemShowing'] = __PZCAutoComplete[id]['highlighted'] - (__PZCAutoComplete[id]['maxitems'] - 1);
     __PZCAutoComplete[id]['lastItemShowing']  = __PZCAutoComplete[id]['highlighted'];
 }

 // Scroll up, or wrapping around from scroll down
 if (__PZCAutoComplete[id]['highlighted'] < __PZCAutoComplete[id]['firstItemShowing']) {
     __PZCAutoComplete[id]['firstItemShowing'] = __PZCAutoComplete[id]['highlighted'];
     __PZCAutoComplete[id]['lastItemShowing']  = __PZCAutoComplete[id]['highlighted'] + (__PZCAutoComplete[id]['maxitems'] - 1);
 }

 if (IndexHighlighted >= 0) {
  var Element = __PZCAutoComplete[id]['dropdown'].childNodes[IndexHighlighted];
  var AktuelleScrollPositionRelativZuContainer = jQuery(Element).position().top;
  __PZCAutoComplete[id]['dropdown'].scrollTop = AktuelleScrollPositionRelativZuContainer + ScrollTopContainer;
 }
}


/**
* Function which handles the keypress event
* @param {type} id The form elements id. Used to identify the correct dropdown. 
*/
function PZCAutoComplete_KeyDown(id) {
 var NurCodeeingabe = jQuery(SelektorPZCEingabebox).hasClass(KlasseNurCodeEingabe);
 var PZCsVorhanden = jQuery(PZCListeInputSelektor).length;
 var idSelektor = "#" + id;
 var ohneAutoSubmit = jQuery(idSelektor).hasClass("ohneOnSubmit"); // verhindert die submit-calls und das abbrechen der Event-Bubble
 
 // Mozilla
 if (arguments[1] != null) {
  event = arguments[1];
 }

 var keyCode = event.keyCode;

 switch (keyCode) {
  // Return/Enter
  case 13:
   if (NurCodeeingabe) {
    if ((__PZCAutoComplete[id]["element"].value.length == 3 || PZCsVorhanden) && !ohneAutoSubmit) {
     __PZCAutoComplete[id]["element"].form.submit();
    }
    break;
   }
   if (__PZCAutoComplete[id]["element"].value.length == 6 && datenfehler_pzc(__PZCAutoComplete[id]["element"]) === false) {
     break;
   }
   if((__PZCAutoComplete[id]["element"].value.length == 6) && !ohneAutoSubmit) {
     __PZCAutoComplete[id]["element"].form.submit();
     break;
   }
   var pzcid = __PZCAutoComplete[id]['highlighted'];
   if(!isNaN(pzcid))
   {
     if(toDisplay[pzcid])
     {
       if(toDisplay[pzcid].auswaehlbar == 0)
       {
         // PZC ist nicht auswaehlbar, verlasse switch case
         break;
       }
     }
   }
   if (__PZCAutoComplete[id]['highlighted'] != null) {
    PZCAutoComplete_SetValue(id);
    PZCAutoComplete_HideDropdown(id);
    PZCAutoComplete_ShowDropdown(id, false, event);
   }

   event.returnValue = false;
   if (!ohneAutoSubmit) {
    event.cancelBubble = true;
   }
  break;

  // Escape
  case 27:
   PZCAutoComplete_HideDropdown(id);
   event.returnValue = false;
   event.cancelBubble = false;
   return true;
  break;

  // Up arrow
  case 38:
   if (!__PZCAutoComplete[id]['isVisible'])
   {
    PZCAutoComplete_ShowDropdown(id, true, event);
   }

   PZCAutoComplete_Highlight(id, -1);
   PZCAutoComplete_ScrollCheck(id, -1);
   return false;
  break;

  // Tab
  case 9:
   if (__PZCAutoComplete[id]['isVisible'])
   {
    var index = __PZCAutoComplete[id]['highlighted'];
    if(!isNaN(index))
    {
      if(toDisplay[index])
      {
        if(toDisplay[index].auswaehlbar == 0)
        {
          PZCAutoComplete_HighlightItem(id, index);
          return false;
        }
      }
    }
    else
    {
     __PZCAutoComplete[id]['element'].focus();
     return false;
    }
    PZCAutoComplete_SetValue(id)
    PZCAutoComplete_HideDropdown(id);
    __PZCAutoComplete[id]['element'].focus();
    return false;
   }
  return;

  // Down arrow
  case 40:
   if (!__PZCAutoComplete[id]['isVisible']) {
    PZCAutoComplete_ShowDropdown(id, true, event);
   }                
   PZCAutoComplete_Highlight(id, 1);
   PZCAutoComplete_ScrollCheck(id, 1);
   return false;
  break;
 }
}


/**
* Function which handles the keyup event
* @param {type} id The form elements id. Used to identify the correct dropdown.
*/
function PZCAutoComplete_KeyUp(id) {
 // Mozilla
 if (arguments[1] != null) {
  event = arguments[1];
 }
 
 var keyCode = event.keyCode;

 switch (keyCode) {
  case 9:
    // Den Index zur Sicherheit noch einmal setzen (wenn zuvor mittels TAB ein ungültiges/nicht auswählbares Element gewählt wurde)
    var index = __PZCAutoComplete[id]['highlighted'];
    PZCAutoComplete_HighlightItem(id, index);
    break;
    
   case 13:
       event.returnValue = false;
       event.cancelBubble = true;
       break;

   case 27:
       PZCAutoComplete_HideDropdown(id);
       event.returnValue = false;
       event.cancelBubble = true;
       break;

   case 38:
   case 40:
       return false;
       break;

   default:
       PZCAutoComplete_ShowDropdown(id, false, event);
       break;
  }
}

/**
* @param {type} id The form elements id. Used to identify the correct dropdown.
* @returns {boolean} Autocompleter hat CSS visibility-Eigenschaft gesetzt 
*/
function PZCAutoComplete_isVisible(id) {
 return __PZCAutoComplete[id]['dropdown'].style.visibility === 'visible';
}


var pzc_complete = false;
var zindex = 0;
function pzcerweiterung(e,f) {
 if(e.value.length >= 6) { // vollstaendiger PZC liegt vor
  document.getElementById("pzc-erweitert-bd-1").style.display = 'none';
  document.getElementById("pzc-erweitert-bd-2").style.display = 'none';
  document.getElementById("pzc-erweitert-bd-3").style.display = 'none';
  
  var tbd = e.value.charAt(5);
  var bdul;
  if(tbd >= 1 && tbd <= 3) {
   bdul = document.getElementById("pzc-erweitert-bd-"+tbd);
   if(bdul) {
    bdul.style.display = '';
   }
   document.getElementById("pzc-erweitert").style.display = '';
  }

  var keyCode = f.keyCode;
  var checkboxindex = false;

  /**
   * Keycode-Handling
   */
  // Escape
  if(keyCode === 27) {
   document.getElementById("pzc-erweitert").style.display = 'none';
   pzc_complete = false;
   return false;
  }

  // 0 Intensivpflichtig
  if(keyCode === 48 || keyCode === 96) {
   if (pzc_complete) {
    jQuery(BDnContainerSelektor + tbd + " " +SelektorPZCErweitertIntensivpflichtig).each(function() {
     var ZustandDisabled = jQuery(this).is(":disabled");
     if (!ZustandDisabled) {
      jQuery(this).prop("checked", !jQuery(this).prop("checked"));
      jQuery(this).trigger("change");
     }
    });
    
    return;
   }
  }

  // 1 Reanimation
  else if(keyCode === 49 || keyCode === 97) {
   if (pzc_complete) {
    jQuery(BDnContainerSelektor + tbd + " " +SelektorPZCErweitertReanimiert).each(function() {
     var ZustandDisabled = jQuery(this).is(":disabled");
     if (!ZustandDisabled) {
      jQuery(this).prop("checked", !jQuery(this).prop("checked"));
      jQuery(this).trigger("change");
     }
    });
    
    return;
   }
  }

  // 2 Beatmet
  else if(keyCode === 50 || keyCode === 98)  {
   if (pzc_complete) {
    jQuery(BDnContainerSelektor + tbd + " " +SelektorPZCErweitertBeatmet).each(function() {
     var ZustandDisabled = jQuery(this).is(":disabled");
     if (!ZustandDisabled) {
      jQuery(this).prop("checked", !jQuery(this).prop("checked"));
      jQuery(this).trigger("change");
     }
    });
    
    return;
   }
  }

  // 3
  else if(keyCode === 51 || keyCode === 99) {
   checkboxindex = 3;
  }
  // 4
  else if(keyCode === 52 || keyCode === 100) {
   checkboxindex = 4;
  }
  // 5
  else if(keyCode === 53 || keyCode === 101) {
   checkboxindex = 5;
  }
  // 6
  else if(keyCode === 54 || keyCode === 102){
   checkboxindex = 6;
  }
  // 7
  else if(keyCode === 55 || keyCode === 103) {
   checkboxindex = 7;
  }
  // 8: unbelegt
  else if(keyCode === 56 || keyCode === 104) {
   checkboxindex = 8;
  }
  // 9: unbelegt
  else if(keyCode === 57 || keyCode === 105) {
   checkboxindex = 9;
  }
  // Ende Keycode-Binding

  var elem;
  var filtercbs;
  if(bdul) {
   filtercbs = bdul.getElementsByTagName('input');
   for(var i=0; i < filtercbs.length; i++) {
    if(filtercbs[i].type === 'checkbox') {
     filtercbs[i].style.zIndex = zindex;
     zindex++;
    }
    // n-te Element auswaehlen
    if(filtercbs[i].type === 'checkbox' && i === checkboxindex) {
     elem = filtercbs[i];
    }
   }
  }

  if(pzc_complete === true) {
   if(elem && (elem.disabled === false)) {
    if(elem.checked === true) {
     elem.checked = false;
    } else { 
     elem.checked = true;
    }
   }
  }

  pzc_complete = true;
 } else { // == kein vollstaendiger PZC
  document.getElementById("pzc-erweitert").style.display = 'none';
  pzc_complete = false;

  /* elemente deaktivieren */
  var parentElement = document.getElementById('pzc-erweitert');
  var cbs = parentElement.getElementsByTagName('input');
  for(var i=0; i < cbs.length; i++) {
   if(cbs[i].type === 'checkbox') {
    //cbs[i].checked = false;
    cbs[i].style.zIndex = 0;
   }
  }

  zindex = 1;

  document.getElementById("pzc-erweitert-bd-1").style.display = 'none';
  document.getElementById("pzc-erweitert-bd-2").style.display = 'none';
  document.getElementById("pzc-erweitert-bd-3").style.display = 'none';
  
  // 2016-10-27: PZC-Labels bereinigen (wenn der PZC unter die ersten drei Stellen faellt, muessen die Synonyme bereinigt werden)
  if (e.value.length < 3) {
   var tSynonyme = document.getElementsByName("pzc-eingabe-synonym-input");
   if (tSynonyme.length > 0)
   {
    for (syncount = 0; syncount < tSynonyme.length; syncount++)
    {
     tSynonyme[syncount].value = "";
    }
   }
   if (document.getElementById("pzc_synonym_id"))
   {
    document.getElementById("pzc_synonym_id").value = "";
   }
   if (document.getElementById("change_zuweisung_pzc_synonym_id"))
   {
    document.getElementById("change_zuweisung_pzc_synonym_id").value = "";
   }
  }
 }
 
 UpdateLabelCSS(); // immer
}


function PZCEingabeBox() {
 var FormularDaten = jQuery(SelektorPZCEingabeboxFormular).serialize();
 var NebenPZCIstAktiv = jQuery(SelektorNebenPZCAktivCheck).val();

 if (NebenPZCIstAktiv === 0) {
  return false;
 }
 
 jQuery.ajax("remote.php", {
  data: FormularDaten,
  beforeSend: function() {
   show_loading_animation();
  }
 }).done(function(e) {
  hide_loading_animation();
  jQuery(SelektorPZCEingabebox).replaceWith(e);
  PZCAutoComplete_Create("pzcinput", pzc_data_array, 20); // pzc_data_array steht inline!
  jQuery(SelektorPZCInputText).focus();
 });
};
// PZCs leeren und neu laden...
function PZCEingabeAbbrechen(e) {
 jQuery(e.target).val("");
 jQuery(SelektorPZCEingabeboxFormular).find("input[name='PZCs[]']").remove();
 PZCEingabeBox();
};

jQuery(document).ready(function(e) {
 jQuery(document).on("keypress", SelektorPZCInputText, function(e) {
  var NurCodeeingabe = jQuery(SelektorPZCEingabebox).hasClass(KlasseNurCodeEingabe);
  
  if (e.keyCode === 43 && ((!NurCodeeingabe && jQuery(e.target).val().length >= 6) || ( NurCodeeingabe && jQuery(e.target).val().length >= 3 ) )) { // plus und vollstaendiger PZC
   PZCEingabeBox();
   return false;
  }
 });
 
 jQuery(document).on("keydown", SelektorPZCInputText, function(e) {
  if (e.key === "Escape") {
   PZCEingabeAbbrechen(e);
  }
 });
 
 jQuery(document).on("click", SelektorPZCEingabeAbbrechen, function(e) {
  PZCEingabeAbbrechen(e);
 });
});
