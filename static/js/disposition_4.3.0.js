jQuery.ajaxSetup({ cache: false });
/* 
 * Dispositionsübersicht
 */
var ACTIVE_AJAX_REQUEST;

var DISP_SUCHE_FORM = "#disposition-suche";
var DISP_SUCHE_TREFFER_CONTAINER = ".disposition-treffer-container";
var DISP_SUCHE_OE_LISTE = ".disp-suche-oe";
var DISP_LISTE = ".disposition-liste";
var DISP_DETAIL_CONTAINER = ".disposition-treffer-container-details";
var DISP_SELECTED_CLASS = "disp-selected";
var DATEPICKER_SUCHE = ".datepicker-suche";
var PATIENTENLISTE_LINK = "a.patientenliste"; /* VORSICHT: Die Klasse patientenliste ist doppelt vergeben (innerhalb der Tabelle noch mal! Deshalb den Selektor nicht alleine auf .patientenliste!) */
var PATIENTENLISTE_CONTAINER_CONTAINER = ".patientenliste-container-container";
var PATIENTENLISTE_CONTAINER = ".patientenliste-container";
var PATIENTENLISTE_LINK_CONTAINER = ".patientenliste-link-container";

var PATIENTENLISTE_EXT_QUELLEN_LINK = "#zuweisungen_aus_schnittstellen";
var PATIENTENLISTE_BEREICHSUEBERGREIFEND_LINK = "#externe_zuweisungen_anderer_versorgungsbereiche";
var PATIENTENLISTE_ALARMIERUNGSBESTAETIGUNG_LINK = "#alarmierungsbestaetigungen";

var PATIENTENLISTE_ANKER = PATIENTENLISTE_LINK_CONTAINER; // die "Hauptpatientenliste" in der BD-Zeile hier wird die liste unten links angehaengt
var SUCHE_CONTAINER = ".disposition-suche-container";
var PATIENTENLISTE_BTN_AKTIV = "patientenliste-btn-aktiv";

var APIZuweisungSelektor = "tr.APIZuweisung";
var AnkerNichtImplementiertSelektor = "a.nicht-implementiert";


var SETZE_PATIENTENLISTE_CONTAINER_POSITION = function(targetContainer, sourceElement) {
 if (targetContainer === undefined || sourceElement === undefined)
 {
  return;
 }
 targetContainer.parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(".content").css({'overflow-y': 'auto'}); /* die breite wird immer angepasst.... */
 
 targetContainer.position({
   my: "left top",
   at: "left bottom",
   of: sourceElement,
   collision: "flipfit"
  });
};

var DISP_SUCHE_DONE = function(data, textStatus, jqXHR, source_element) {
 var target = jQuery(source_element).parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(DISP_SUCHE_TREFFER_CONTAINER);
 /** Antwort kann JSON oder HTML sein */
 if (jqXHR.responseJSON) {
  jQuery(target).html(jQuery.parseHTML(data.data.patientenliste));
 } else {
  jQuery(target).html(data);
 }
};

var DISP_SUCHE_FEHLER = function(jqXHR, textStatus, errorThrown, source_element) {
 var target = jQuery(source_element).parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(DISP_SUCHE_TREFFER_CONTAINER);
 jQuery(target).html("<p>Es ist ein Fehler aufgetreten.</p>");
};

var DISP_SUCHE_BEFORESEND = function(source_element) {
	jQuery(DISP_DETAIL_CONTAINER).addClass("hide");
 show_loading_animation();
 var target = jQuery(source_element).parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(DISP_SUCHE_TREFFER_CONTAINER);
 jQuery(target).html($GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL);
};

var DISP_SUCHE_ALWAYS = function() {
 hide_loading_animation();
};

var DISP_SUCHE_LEEREN = function(source_element) {
 var target = jQuery(source_element).parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(DISP_SUCHE_TREFFER_CONTAINER);
 jQuery(target).empty();
};

/** Zuweisungen regulär */
var DISP_SUCHE_REQUEST = function(source_element) {
  ACTIVE_AJAX_REQUEST = jQuery.ajax({
   url: "remote.php",
   beforeSend: DISP_SUCHE_BEFORESEND(source_element),
   data: jQuery(DISP_SUCHE_FORM).serialize(),
   method: "POST",
			cache: false
  })
  .done(function(data, textStatus, jqXHR) { DISP_SUCHE_DONE(data, textStatus, jqXHR, source_element); } )
  .fail(function(jqXHR, textStatus, errorThrown) { DISP_SUCHE_FEHLER(jqXHR, textStatus, errorThrown, source_element); })
  .always(DISP_SUCHE_ALWAYS);
};

/** Externe Quellen */
var DISP_EXT_QUELLEN_DONE = function(data, textStatus, jqXHR, source_element) {
	var target = jQuery(source_element).parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(DISP_SUCHE_TREFFER_CONTAINER);
	/* var obj = jQuery.parseJSON( data ); */
 jQuery(target).html(jQuery.parseHTML(data.data));
};

var DISP_EXT_QUELLEN_REQUEST = function(source_element) {
	var FormDataArray = jQuery(DISP_SUCHE_FORM).serializeArray();
 jQuery.each(FormDataArray, function(index, item) {
  if (item.name === 'view') {
					item.value = "zuweisungen_aus_schnittstellen";
			}
 });
	var FinalData = jQuery.param(FormDataArray);
	
  ACTIVE_AJAX_REQUEST = jQuery.ajax({
   url: "remote.php",
   beforeSend: DISP_SUCHE_BEFORESEND(source_element),
   data: FinalData, /* wichtig: eigentlich das falsche Formular! enthält aber die si */
   method: "POST",
			cache: false
  })
  .done(function(data, textStatus, jqXHR) { DISP_EXT_QUELLEN_DONE(data, textStatus, jqXHR, source_element); } )
  .fail(function(jqXHR, textStatus, errorThrown) { DISP_SUCHE_FEHLER(jqXHR, textStatus, errorThrown, source_element); })
  .always(DISP_SUCHE_ALWAYS);
};

/** Bereichsübergreifende Zuweisungen */
var DISP_BEREICHSUEBERGREIFEND_DONE = function(data, textStatus, jqXHR, source_element) {
	var target = jQuery(source_element).parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(DISP_SUCHE_TREFFER_CONTAINER);
	/* var obj = jQuery.parseJSON( data ); */
 jQuery(target).html(data.data);
};

var DISP_BEREICHSUEBERGREIFEND_REQUEST = function(source_element) {
	
	/** 
		* parameter view von disposition auf zuweisungen_anderer_versorgungsbereiche ersetzen,
		* siehe dazu auch den Kommentar unter data im ajax unten (wir posten hier theoretisch "irgendein" suchformular und passen vorab die Parameter an) 
		*/
	var FormDataArray = jQuery(DISP_SUCHE_FORM).serializeArray();
	jQuery.each(FormDataArray, function(index, item) {
			if (item.name === 'view') {
					item.value = "zuweisungen_anderer_versorgungsbereiche";
			}
	});
	var FinalData = jQuery.param(FormDataArray);
	
  ACTIVE_AJAX_REQUEST = jQuery.ajax({
   url: "remote.php",
   beforeSend: DISP_SUCHE_BEFORESEND(source_element),
   data: FinalData, /* wichtig: eigentlich das falsche Formular! enthält aber die si */
   method: "POST",
			cache: false
  })
  .done(function(data, textStatus, jqXHR) { DISP_BEREICHSUEBERGREIFEND_DONE(data, textStatus, jqXHR, source_element); })
  .fail(function(jqXHR, textStatus, errorThrown) { DISP_SUCHE_FEHLER(jqXHR, textStatus, errorThrown, source_element); })
  .always(DISP_SUCHE_ALWAYS);
};

/** Alarmierungsbestätitung */
var DISP_ALARMIERUNGSBESTAETIGUNG_DONE = function(data, textStatus, jqXHR, source_element) {
	var target = jQuery(source_element).parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(DISP_SUCHE_TREFFER_CONTAINER);
	/* var obj = jQuery.parseJSON( data ); */
 jQuery(target).html(data.data);
};

var DISP_ALARMIERUNGSBESTAETIGUNG_REQUEST = function(source_element)
{
 /** vorsicht im handler wird view als aktion durchgereicht! */
	var obj = { si: $IVENA_SI, view: "ls_infobox_alarmbestaetigung", aktion: "alarmierungsbestaetigung" };
	ACTIVE_AJAX_REQUEST = jQuery.ajax({
   url: "remote.php",
   beforeSend: DISP_SUCHE_BEFORESEND(source_element),
   data: obj, /* wichtig: eigentlich das falsche Formular! enthält aber die si */
   method: "GET",
			cache: false
  })
  .done(function(data, textStatus, jqXHR) { DISP_ALARMIERUNGSBESTAETIGUNG_DONE(data, textStatus, jqXHR, source_element); } )
  .fail(function(jqXHR, textStatus, errorThrown) { DISP_SUCHE_FEHLER(jqXHR, textStatus, errorThrown, source_element); })
  .always(DISP_SUCHE_ALWAYS);
	
};


var DISP_DETAILS_DONE = function(data) {
	jQuery(DISP_DETAIL_CONTAINER).removeClass("hide");
 jQuery(DISP_DETAIL_CONTAINER).html(data);
};

var DISP_HOLE_DISPOSITION_REQUEST = function(zuweisung_id) {
 jQuery.ajax({
  url: "remote.php",
  beforeSend: DISP_SUCHE_BEFORESEND,
  data: {
   "si": $IVENA_SI,
   "view": "disposition_detail",
   "idliste": zuweisung_id
  },
  method: "POST"
 })
  .done(DISP_DETAILS_DONE)
  .fail(DISP_SUCHE_FEHLER)
  .always(DISP_SUCHE_ALWAYS);
};

var DISP_SET_SELECTED_DISP = function(selected_disp) {
 jQuery(DISP_LISTE+" tr").removeClass(DISP_SELECTED_CLASS);
 jQuery(selected_disp).addClass(DISP_SELECTED_CLASS);
};

var SUCHE_EVENT_CHANGE_SELECTOR = DISP_SUCHE_FORM + " select, " + DISP_SUCHE_FORM + " input[type=checkbox]";
var SUCHE_EVENT_KEY_SELECTOR = DISP_SUCHE_FORM + " input[type=text]";

var INIT_DATEPICKER = function(target) {
 jQuery.datepicker.setDefaults(jQuery.datepicker.regional["de"]);
 
 var dp = jQuery(target).datepicker({
  showButtonPanel: true, 
  dateFormat: "dd.mm.yy",
  changeYear: true, 
  changeMonth: true, 
  showWeek: true,
  yearRange: '2012:+0' });
 
 jQuery(dp).datepicker('show');
};

var PATIENTENLISTE_ANZEIGEN = function(e, kontext) {
  var sourceElement = jQuery(e.target);
		var targetPatientenliste = sourceElement.parents(PATIENTENLISTE_CONTAINER_CONTAINER).find(PATIENTENLISTE_CONTAINER);
  var sourceElementAusrichtung = sourceElement;
  
		/** alten AJAX-Request abbrechen */
		if (typeof ACTIVE_AJAX_REQUEST !== "undefined") {
			ACTIVE_AJAX_REQUEST.abort();
		}
		
  jQuery(PATIENTENLISTE_CONTAINER).not(targetPatientenliste).hide();
  schliesse_alle_infoboxen();
		
		var SUCHE_REQUEST = DISP_SUCHE_REQUEST; /** Funktionsaufruf variabel!!! */
		var AKT_PATIENTENLISTE_ANKER = targetPatientenliste;
		jQuery(SUCHE_CONTAINER).show(); /** normal mit Suche */
		if (kontext === PATIENTENLISTE_EXT_QUELLEN_LINK) {
			SUCHE_REQUEST = DISP_EXT_QUELLEN_REQUEST;
			sourceElementAusrichtung = jQuery(PATIENTENLISTE_LINK); // virtuell immer vom "Hauptbutton" aus -> nur für die Positionierung!
			jQuery(SUCHE_CONTAINER).hide(); /* Externe Quellen hat keine Suche / Filter) */
		}
		else if (kontext === PATIENTENLISTE_BEREICHSUEBERGREIFEND_LINK) {
			SUCHE_REQUEST = DISP_BEREICHSUEBERGREIFEND_REQUEST;
			sourceElementAusrichtung = jQuery(PATIENTENLISTE_LINK); // virtuell immer vom "Hauptbutton" aus -> nur für die Positionierung!
			jQuery(SUCHE_CONTAINER).hide();
		}
		else if (kontext === PATIENTENLISTE_ALARMIERUNGSBESTAETIGUNG_LINK) {
			SUCHE_REQUEST = DISP_ALARMIERUNGSBESTAETIGUNG_REQUEST;
			sourceElementAusrichtung = jQuery(PATIENTENLISTE_LINK); // virtuell immer vom "Hauptbutton" aus -> nur für die Positionierung!
			jQuery(SUCHE_CONTAINER).hide();
		}
  
  if (jQuery(sourceElementAusrichtung).parents("ul").length > 0) { // sonst wurde u. U. am span ausgerichtet
   sourceElementAusrichtung = jQuery(sourceElementAusrichtung).parents("ul").first();
  }
		
		targetPatientenliste.hide();
		PATIENTENLISTE_REMOVE_ACTIVE_BUTTON_CLASS();
		
  targetPatientenliste.fadeToggle(0, "linear", function() {
   /* vorsicht: wird für jedes PATIENTENLISTE_CONTAINER-Element gefeuert (sollte nur 1 sein!)  */
   if (targetPatientenliste.is(':visible')) {
				sourceElement.closest("li").addClass(PATIENTENLISTE_BTN_AKTIV); /** uebergeordnete li bekommt die klasse */
				
    /* DISP_SUCHE_REQUEST(e.target); */
				SUCHE_REQUEST(e.target);
    automatische_aktualisierung_unterbrechen();
    SETZE_PATIENTENLISTE_CONTAINER_POSITION(AKT_PATIENTENLISTE_ANKER, sourceElementAusrichtung); /* targetPatientenliste */
   }
   else {
				PATIENTENLISTE_SCHLIESSEN(e.target);
   }
  });
};

var PATIENTENLISTE_REMOVE_ACTIVE_BUTTON_CLASS = function() {
	/** nachfolgenden ausdruck kann man irgendwann mal schoener gestalten... entfernt die aktiv-klasse auf allen schaltern */
	jQuery(PATIENTENLISTE_CONTAINER_CONTAINER).find("*").each(function(){
	 jQuery(this).removeClass(PATIENTENLISTE_BTN_AKTIV);
	});
};

var PATIENTENLISTE_SCHLIESSEN = function(sender) {
	DISP_SUCHE_LEEREN(sender);
	PATIENTENLISTE_REMOVE_ACTIVE_BUTTON_CLASS();

	jQuery(PATIENTENLISTE_CONTAINER).hide();
	automatische_aktualisierung_aktivieren();
};

jQuery(document).ready(function(){
  
  jQuery(document).on("click", DATEPICKER_SUCHE, function(event) {
   INIT_DATEPICKER(event.target);
  });
  
  /* INIT_DATEPICKER(); */
  
  jQuery(document).on("change", SUCHE_EVENT_CHANGE_SELECTOR, function(event) {
   DISP_SUCHE_REQUEST(this);
   return false;
  });
  
  jQuery(document).on("keyup", SUCHE_EVENT_KEY_SELECTOR, function(event) {
   DISP_SUCHE_REQUEST();
   return false;
  });
  
  // temporaer deaktiviert
		/*
  jQuery(document).on("click", DISP_LISTE+" tbody tr", function(event){
   DISP_SET_SELECTED_DISP(this);
   DISP_HOLE_DISPOSITION_REQUEST(jQuery(this).data("zuweisung_id"));
   return false;
  });
  */
 
  /** normale Zuweisungsliste */
  jQuery(document).on("click", PATIENTENLISTE_LINK, function(e) {
			PATIENTENLISTE_ANZEIGEN(e, "");
			return false;
		});
		
		/** Zuweisungen aus externen Quellen */
		jQuery(document).on("click", PATIENTENLISTE_EXT_QUELLEN_LINK, function(e) {
			PATIENTENLISTE_ANZEIGEN(e, PATIENTENLISTE_EXT_QUELLEN_LINK);
			return false;
		});
 
	/** Bereichsübergreifende Zuweisungen */
	jQuery(document).on("click", PATIENTENLISTE_BEREICHSUEBERGREIFEND_LINK, function(e) {
			PATIENTENLISTE_ANZEIGEN(e, PATIENTENLISTE_BEREICHSUEBERGREIFEND_LINK);
			return false;
		});
		
		/** Alarmierungsbestätigung */
		jQuery(document).on("click", PATIENTENLISTE_ALARMIERUNGSBESTAETIGUNG_LINK, function(e) {
			PATIENTENLISTE_ANZEIGEN(e, PATIENTENLISTE_ALARMIERUNGSBESTAETIGUNG_LINK);
			return false;
		});
		
	
 jQuery(PATIENTENLISTE_CONTAINER + " .close").on("click", function() {
   PATIENTENLISTE_SCHLIESSEN(this);
 });


 jQuery(document).on("click", APIZuweisungSelektor + " " + AnkerNichtImplementiertSelektor, function(e) {
  alert("Diese Funktion steht in dieser Version noch nicht zur Verfügung.");
  return false;
 });
});

 jQuery(document).on("click", ".patientenliste-container .zuweisung_loeschen", function(e) {
  return confirm($GCS_LOCALE_ZUWEISUNG_LOESCHEN);
 });