let $IVENA_VIEWBOX = "Regelversorgung";
var $IVENA_AJAX_ENDPOINT_URL = "remote.php";
var $IVENA_AUTOREFERESH_PARAMETER = "autorefresh=1";

var xhttp_alarmierung = false;
var xhttp_api_geoservice = false;
var div_alarmierungsbox_id = "";
var div_plbx_id = "";

try // IE6
{
 xhttp_alarmierung = new ActiveXObject('Msxml2.XMLHTTP');
 xhttp_api_geoservice = new ActiveXObject('Msxml2.XMLHTTP');
 xhttp_zuweisung_bestaetigen = new ActiveXObject('Msxml2.XMLHTTP');
}
catch(e)
{
 try // IE5
 {
  xhttp_alarmierung=new ActiveXObject('Microsoft.XMLHTTP');
  xhttp_api_geoservice=new ActiveXObject('Microsoft.XMLHTTP');
  xhttp_zuweisung_bestaetigen=new ActiveXObject('Microsoft.XMLHTTP');
 }
 catch(e)
 {
  try // Mozilla
  {
   xhttp_alarmierung=new XMLHttpRequest();
   xhttp_api_geoservice=new XMLHttpRequest();
   xhttp_zuweisung_bestaetigen=new XMLHttpRequest();
  }
  catch(e) 
  {
   // Kein xhttp-Objekt vorhanden
  }
 }
}

// Selektoren
var AlarmierungsBoxSelektor = "div.alarmierungsbox";
var AlarmierungAnkerSelektor = "a.alarmierung-anker";
var KontaktBoxSelektor = "div.kontaktbox";
var KontaktBoxSchliessenSelektor = KontaktBoxSelektor + " .close";
var KontaktBoxAnkerSelektor = "a.kontaktbox-anker";
var DiagnoseBoxSelektor = "div.diagnosebox";
var AnkerOEZuweisbar = "img.OEZuweisbar";
var scrollToSelektor = "input[name='scrollTo']";
var ZertifikatInfoboxSelektor = ".zertifikats_infobox";
var ZertifikatSelektor = ".zertifikat";
var ZertifikatContainerSelektor = ".zertifikat-box-container";

var ZertifikatAnzeigen = function (Zertifikat, ErneutVersuchen) {
 var AlleZertifikatButtons = jQuery(ZertifikatSelektor).not(Zertifikat.target);
 AlleZertifikatButtons.removeClass("aktiv");
 
 var BTNAktiv = jQuery(Zertifikat.target).hasClass("aktiv");

 var CSSKlassen = jQuery(Zertifikat.target).attr("class");
 var CSSKlassenArray = CSSKlassen.split(" ");
 
 if (jQuery(ZertifikatContainerSelektor).html()) {
  hide_loading_animation();

  // anzeigen
  var Infoboxen = jQuery(ZertifikatContainerSelektor).children(ZertifikatInfoboxSelektor);
  Infoboxen.each(function( index , Infobox) {
   jQuery(Infobox).addClass("hide");
  });

  Infoboxen.each(function( index , Infobox) {
   var CSSKlassenArrayAusContainer = jQuery(Infobox).attr("class").split(" ");

   /** vollstaendigen klassennamen matchen */
   CSSKlassenGefiltert = CSSKlassenArray.filter(function(n) {
    return (CSSKlassenArrayAusContainer.indexOf(n) !== -1);
   });

   // fuer alle Treffer....
   jQuery(CSSKlassenGefiltert).each(function (index, element) {
    if (!BTNAktiv) {
     jQuery(Infobox).removeClass("hide").position({
      of: jQuery(Zertifikat.target).parents("td").first(),
      my: "left top",
      at: "right top",
      collision: "none flip"
     });
    } else {
     jQuery(Infobox).addClass("hide");
    }
   });
  });

  jQuery(Zertifikat.target).toggleClass("aktiv", !BTNAktiv);
 } else if (ErneutVersuchen !== false) { // ajax zum holen
  show_loading_animation();
  jQuery.ajax($IVENA_AJAX_ENDPOINT_URL, {
   data: {
    si: $IVENA_SI,
    view: 'zertifikate'
   }
  }).done( function(data) {
   jQuery(ZertifikatContainerSelektor).html(jQuery.parseHTML(data));
   ZertifikatAnzeigen(Zertifikat, false); // Rekursion!
  });
 }
};

/** 
 * IVENA-Audio-Alarmierung
 * 
 * spielt alle audio-Tags AlleSignaltoene nacheinander ab
 * wenn ein Signalton das data-Attribut anzahlwdh traegt wird der Ton anzahlwdh-mal wiederholt
 * bei einem Klick im DOM werden die folgetoene nicht mehr abgespielt
 * wenn das audio-tag ein Attribut sessionStorageId hat wird persistiert, dass es bereits abgespielt wurde
 * 
 * @todo der loop funktioniert noch nicht wahrscheinlich weil der ton bereits als gespielt markiert wurde
 **/
var DataAttributSessionStorageId = "sessionstorageid";
var localStorageAudioPrefix = "audio_";
var AudioVolumeGlobal = .25; // sonst droht Tinnitus

var IVENAAudioAlarmierung = function(AlleSignaltoene) {
 var MeineAnzahlWiederholungen = new Array();
 if (AlleSignaltoene.length) {
 var SessionstorageVorhanden = (typeof(window.sessionStorage) !== "undefined");
 
  // Theoretisch koennten es mehrere sein, praktisch sollte es immer nur eins sein!
  jQuery(AlleSignaltoene).each( function(index, AktuellesElement) {
   AktuellesElement.volume = AudioVolumeGlobal;
   MeineAnzahlWiederholungen[index] = 0;
   var MeineAnzahlWDH = parseInt(jQuery(AktuellesElement).data("anzahlwdh") || 0);
   var MeineSessionStorageId = jQuery(AktuellesElement).data(DataAttributSessionStorageId);
   var KombinierteSessionStorageId = localStorageAudioPrefix + MeineSessionStorageId;
   
   var SoundWurdeBereitsAbgespielt = 0;
   
   var NaechstesAudioTag = AlleSignaltoene.get(index + 1);
   var playPromise;

   jQuery(AktuellesElement).on("ended", function() {
    MeineAnzahlWiederholungen[index] += 1;
    if (MeineAnzahlWiederholungen <= MeineAnzahlWDH) {
     AktuellesElement.currentTime = 0;
     playPromise = AktuellesElement.play();
    } else {
     if (jQuery(NaechstesAudioTag).length) {
      playPromise = NaechstesAudioTag.play();
     }
    }
    if (playPromise !== undefined) { playPromise.then(function() {}).catch(function() {}); }
   });
   
   jQuery(AktuellesElement).on("pause", function(triggerEvent) {
    /* console.log("paused"); */
    if (jQuery(NaechstesAudioTag).length) {
      playPromise = NaechstesAudioTag.play();
     }
   });
   
   jQuery(AktuellesElement).on("play", function(Event) {
    /* console.log("play"); */
    /** sich selbst ueberpruefen und evtl. ueberspringen... */
    /** zustand persistieren */
    if (SessionstorageVorhanden) {
     if (typeof(MeineSessionStorageId) !== "undefined") {
      SoundWurdeBereitsAbgespielt = parseInt(window.sessionStorage[KombinierteSessionStorageId]);
      if (!(SoundWurdeBereitsAbgespielt === 1)) {
       window.sessionStorage[KombinierteSessionStorageId] = 1; /** als abgespielt markieren */
      } else {
       playPromise = AktuellesElement.pause();
      }
     }
    }
    if (playPromise !== undefined) { playPromise.then(function() {}).catch(function() {}); }
   });
   
   if (playPromise !== undefined) { playPromise.then(function() {}).catch(function() {}); }
  });

  var ErstesAudioElement = AlleSignaltoene.get(0);
  var playPromise = ErstesAudioElement.play();
  if (playPromise !== undefined) { playPromise.then(function() {}).catch(function() {}); }
  
  /** beim Klick irgendwo im DOM sofort alle folgenden Toene abbrechen */
  jQuery(document).on("click", function() {
   jQuery(AlleSignaltoene).unbind();
  });
 }
}; /** Ende Audio */

var CacheOESuche = {};

function BereitsSelektierteOEsBereinigen(tData, BereitsSelektierteOEIds) {
 /** Filtern wenn bereits vorhanden */
 var rData = [];
 if (BereitsSelektierteOEIds.length > 0 && tData.length > 0) {
  jQuery.each(tData, function( index , OEData) {
   if (!(BereitsSelektierteOEIds.includes(OEData.value))) {
    rData.push(OEData);
   }
  });
 }
 return rData;
};

/**
 * 
 * @param {type} callback
 * @function callbackHoleBereitsSelektierteOEs muss ein jQuery-DOM liefern
 * @returns {undefined}
 */
var AutocompleterOESuche = function(callback, callbackHoleBereitsSelektierteOEs) {
 /* alert("Autocompleter kommt"); */
 var AutocompleterIstNochNichtInstanziiert = (jQuery( SelektorOESuche ).autocomplete( "instance" ) === undefined);
 // alert(AutocompleterIstInstanziiert);
 
 if (AutocompleterIstNochNichtInstanziiert) { // es kann sein das wir AutocompleterIstNochNichtInstanziiert optional machen muessen
  jQuery( SelektorOESuche ).autocomplete({
  minLength: 3,
  focus: function( event, ui ) {
   jQuery( this.element ).val( ui.item.label );
   return false;
  },
  close : function (event, ui) { // behaelt den autocompleter offen... optional machen (?) -> geht auch noch auf ein globales element
   if (!jQuery("ul.ui-autocomplete").is(":visible")) {
    jQuery("ul.ui-autocomplete").show();
   }
  },
  source: function( request, response ) {
    var term = request.term;
    
    var BereitsSelektierteOEIds = [];
    if (callbackHoleBereitsSelektierteOEs) {
     var tBereitsSelektierteOEIds = callbackHoleBereitsSelektierteOEs();
     jQuery.each(tBereitsSelektierteOEIds, function(idx, OEInput) {
      BereitsSelektierteOEIds.push(parseInt(jQuery(OEInput).val()));
     });
    }
    
    if ( term in CacheOESuche ) {
     var tData = CacheOESuche[ term ];
     let rData = BereitsSelektierteOEsBereinigen(tData, BereitsSelektierteOEIds);
     response( rData );
     return;
    }
    
    var Suchkontext = jQuery(this.element).first().data("kontext");
    jQuery.getJSON( $IVENA_AJAX_ENDPOINT_URL+"?si="+$IVENA_SI+"&view=oe_suche&kontext="+Suchkontext, request, function( data, status, xhr ) {
      CacheOESuche[ term ] = data;
      let rData = BereitsSelektierteOEsBereinigen(data, BereitsSelektierteOEIds);
      response( rData );
    });
  },
  open: function () {
   jQuery(this).data("uiAutocomplete").menu.element.addClass("OETitel");
  },
  select: function( event, ui ) {
   jQuery(event.target).first().val(""); // Suchfeld leeren
   jQuery(event.target).parents(".OESucheContainer").find(".Trefferliste").append('<input type="hidden" name="OEIdListe[][value]" value="'+ui.item.value+'" />');
   // ajax mit dieser ID losschicken
   // alert(ui.item.value);
   if (callback) {
    callback(event, ui);
   }
   return false;
  },
  _renderItem: function( ul, item ) {
   return jQuery("<li>").attr( "data-value", item.value ).append( item.label ).appendTo( ul );
  }
 });
 }
};

var SelektorFormularAktiverVorschlag = "form#zuweisung-vorschlag";
var SelektorSignaltonZuweisungsVorschlag = "audio.SignaltonVorschlag";
var SelektorSignaltonMANV = "audio.SignaltonMANV";
var FunkrufnameAjax;

var SelektorOESuche = "[name='OESuche']";
var DataAttributOESucheKontext = "kontext";

var SelektorZuweisungsformular = "#lst-alarmierungseingabe";
var SelektorPZCFilter = "#pzc-filter-change-zuweisung input[type='checkbox']";
var SelektorSchalterZuweisungAendernSubmit = "#zuweisung-aendern-submit";

var ErweitertePZCFilterPruefung = function(e) {
 var jTarget = jQuery(e.target); // sollte das form sein
 if (!jTarget.is("form")) {
  jTarget = jQuery(jTarget).parents("form");
 }
 var Meldungen = "";
 if (jTarget.hasClass("validiere-pzc-filter")) { // nur dann wird validiert!

  // jQuery(e).preventDefault();

  var PZCFilter = jTarget.find(SelektorPZCFilter);
  
  // Reanimation
  var FilterExistiertUndNichtDisabledReanimiert = (jQuery(PZCFilter).filter("[name='pzcfilter[220]']").length && !jQuery(PZCFilter).filter("[name='pzcfilter[220]']").prop("disabled"));
  var ZuweisungsfeldReanimiertIstVorhanden = (jTarget.find("[name='zuweisung_reanimation_id'], [name='zuweisung[zuweisung_reanimation_id]']").length > 0);
  var FilterSelektiertReanimiert = jQuery(PZCFilter).filter("[name='pzcfilter[220]']").prop("checked");
  var ZuweisungsfeldSelektiertReanimiert = (jTarget.find("[name='zuweisung_reanimation_id'][value=1]").prop("checked") || jTarget.find("[name='zuweisung[zuweisung_reanimation_id]'][value=1]").prop("checked"));
  
  // Beatmet
  var FilterExistiertUndNichtDisabledBeatmet = (jQuery(PZCFilter).filter("[name='pzcfilter[210]']").length && !jQuery(PZCFilter).filter("[name='pzcfilter[210]']").prop("disabled"));
  var ZuweisungsfeldBeatmetIstVorhanden = (jTarget.find("[name='zuweisung_beatmet_id'], [name='zuweisung[zuweisung_beatmet_id]']").length > 0);
  var FilterSelektiertBeatmet = jQuery(PZCFilter).filter("[name='pzcfilter[210]']").prop("checked");
  var ZuweisungsfeldSelektiertBeatmet = (jTarget.find("[name='zuweisung_beatmet_id'][value=1]").prop("checked") || jTarget.find("[name='zuweisung[zuweisung_beatmet_id]'][value=1]").prop("checked"));
  
  // Ansteckungsfaehig
  var FilterExistiertUndNichtDisabledAnsteckungsfaehig = (jQuery(PZCFilter).filter("[name='pzcfilter[240]']").length && !jQuery(PZCFilter).filter("[name='pzcfilter[240]']").prop("disabled"));
  var FilterSelektiertAnsteckungsfaehig = jQuery(PZCFilter).filter("[name='pzcfilter[240]']").prop("checked");
  
  var ZuweisungsfeldSelektiertAnsteckungsfaehig = ((jTarget.find("[name='zuweisung_infektioes_id']").val() > 0) || (jTarget.find("[name='zuweisung[zuweisung_infektioes_id]']").val() > 0));
  var ZuweisungsfeldAnsteckungsfaehigIstVorhanden = (jTarget.find("[name='zuweisung_infektioes_id'], [name='zuweisung[zuweisung_infektioes_id]']").length > 0);
  if (ZuweisungsfeldAnsteckungsfaehigIstVorhanden) { /** Sonderfall 'Keine' bzw. negierende Aussage */
   var IstNegierendeAussage = jTarget.find("[name='zuweisung_infektioes_id'] :selected, [name='zuweisung[zuweisung_infektioes_id]'] :selected").data("negierendeaussage");
   if (!isNaN(IstNegierendeAussage) && (parseInt(IstNegierendeAussage) === 1)) {
    ZuweisungsfeldSelektiertAnsteckungsfaehig = false; /** im Sinne der Datenfehlerpruefung keine Selektion */
   }
  }
  
  // Schockraum
  var FilterExistiertUndNichtDisabledSchockraum = (jQuery(PZCFilter).filter("[name='pzcfilter[40]']").length && !jQuery(PZCFilter).filter("[name='pzcfilter[40]']").prop("disabled"));
  var ZuweisungsfeldSchockraumExistiert = ((jTarget.find("[name='zuweisung_schockraumres_id']").length || jTarget.find("[name='zuweisung[zuweisung_schockraumres_id]']").length) > 0);
  var FilterSelektiertSchockraum = jQuery(PZCFilter).filter("[name='pzcfilter[40]']").prop("checked");
  var ZuweisungsfeldSelektiertSchockraum = (jTarget.find("[name='zuweisung_schockraumres_id'][value=1]").prop("checked") || jTarget.find("[name='zuweisung[zuweisung_schockraumres_id]'][value=1]").prop("checked"));
  
  // Herzkatheter
  var FilterExistiertUndNichtDisabledHerzkatheter = (jQuery(PZCFilter).filter("[name='pzcfilter[50]']").length && !jQuery(PZCFilter).filter("[name='pzcfilter[50]']").prop("disabled"));
  var ZuweisungsfeldHerzkatetherExistiert = ((jTarget.find("[name='zuweisung_herzkatheterres_id']").length || jTarget.find("[name='zuweisung[zuweisung_herzkatheterres_id]']").length) > 0);
  var FilterSelektiertHerzkatheter = jQuery(PZCFilter).filter("[name='pzcfilter[50]']").prop("checked");
  var ZuweisungsfeldSelektiertHerzkatheter = (jTarget.find("[name='zuweisung_herzkatheterres_id'][value=1]").prop("checked") || jTarget.find("[name='zuweisung[zuweisung_herzkatheterres_id]'][value=1]").prop("checked"));

  // Schwanger
  var FilterExistiertUndNichtDisabledSchwanger = (jQuery(PZCFilter).filter("[name='pzcfilter[70]']").length && !jQuery(PZCFilter).filter("[name='pzcfilter[70]']").prop("disabled"));
  var ZuweisungsfeldSchwangerExistiert = ((jTarget.find("[name='zuweisung_schwanger_id']").length || jTarget.find("[name='zuweisung[zuweisung_schwanger_id]']").length) > 0);
  var FilterSelektiertSchwanger = jQuery(PZCFilter).filter("[name='pzcfilter[70]']").prop("checked");
  var ZuweisungsfeldSelektiertSchwanger = (jTarget.find("[name='zuweisung_schwanger_id'][value=1]").prop("checked") || jTarget.find("[name='zuweisung[zuweisung_schwanger_id]'][value=1]").prop("checked"));
  
  // Arbeitsunfall
  var FilterExistiertUndNichtDisabledArbeitsunfall = (jQuery(PZCFilter).filter("[name='pzcfilter[60]']").length && !jQuery(PZCFilter).filter("[name='pzcfilter[60]']").prop("disabled"));
  var FilterSelektiertArbeitsunfall = jQuery(PZCFilter).filter("[name='pzcfilter[60]']").prop("checked");
  var ZuweisungsfeldArbeitsunfallExistiert = ((jTarget.find("[name='zuweisung_arbeitsunfall_id']").length || jTarget.find("[name='zuweisung[zuweisung_arbeitsunfall_id]']").length) > 0);
  var ZuweisungsfeldSelektiertArbeitsunfall = (jTarget.find("[name='zuweisung_arbeitsunfall_id'][value=1]").prop("checked") || jTarget.find("[name='zuweisung[zuweisung_arbeitsunfall_id]'][value=1]").prop("checked"));


  if (FilterExistiertUndNichtDisabledReanimiert && ZuweisungsfeldReanimiertIstVorhanden) {
   if (FilterSelektiertReanimiert && !ZuweisungsfeldSelektiertReanimiert) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_REANIMATION;
   }
   if (ZuweisungsfeldSelektiertReanimiert && !FilterSelektiertReanimiert) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_REANIMATION_INVERS;
   }
  }

  if ((FilterExistiertUndNichtDisabledBeatmet || FilterExistiertUndNichtDisabledReanimiert) && (ZuweisungsfeldBeatmetIstVorhanden)) {
   if (FilterSelektiertBeatmet && !ZuweisungsfeldSelektiertBeatmet) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_BEATMET;
   }
   if (ZuweisungsfeldSelektiertBeatmet && !FilterSelektiertBeatmet) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_BEATMET_INVERS;
   }
  }

  if (FilterExistiertUndNichtDisabledAnsteckungsfaehig && ZuweisungsfeldAnsteckungsfaehigIstVorhanden) {
   if (FilterSelektiertAnsteckungsfaehig && !ZuweisungsfeldSelektiertAnsteckungsfaehig) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_ANSTECKUNGSFAEHIG;
   }
   if (ZuweisungsfeldSelektiertAnsteckungsfaehig && !FilterSelektiertAnsteckungsfaehig) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_ANSTECKUNGSFAEHIG_INVERS;
   }
  }

  if (FilterExistiertUndNichtDisabledSchockraum && ZuweisungsfeldSchockraumExistiert) {
   if (FilterSelektiertSchockraum && !ZuweisungsfeldSelektiertSchockraum) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_SCHOCKRAUM;
   }
   if (ZuweisungsfeldSelektiertSchockraum && !FilterSelektiertSchockraum) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_SCHOCKRAUM_INVERS;
   }
  }

  if (FilterExistiertUndNichtDisabledHerzkatheter && ZuweisungsfeldHerzkatetherExistiert) {
   if (FilterSelektiertHerzkatheter && !ZuweisungsfeldSelektiertHerzkatheter) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_HERZKATHETER;
   }
   if (ZuweisungsfeldSelektiertHerzkatheter && !FilterSelektiertHerzkatheter) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_HERZKATHETER_INVERS;
   }
  }

  if (FilterExistiertUndNichtDisabledSchwanger && ZuweisungsfeldSchwangerExistiert) {
   if (FilterSelektiertSchwanger && !ZuweisungsfeldSelektiertSchwanger) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_SCHWANGER;
   }
   if (ZuweisungsfeldSelektiertSchwanger && !FilterSelektiertSchwanger) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_SCHWANGER_INVERS;
   }
  }

  if (FilterExistiertUndNichtDisabledArbeitsunfall && ZuweisungsfeldArbeitsunfallExistiert) {
   if (FilterSelektiertArbeitsunfall && !ZuweisungsfeldSelektiertArbeitsunfall) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_ARBEITSUNFALL;
   }
   if (ZuweisungsfeldSelektiertArbeitsunfall && !FilterSelektiertArbeitsunfall) {
    Meldungen += "\n"+$GCS_LOCALE_FILTER_ZUWEISUNGSFELD_ABWEICHUNG_ARBEITSUNFALL_INVERS;
   }
  }
 }
 
 if (Meldungen.length > 0) {
  return confirm(Meldungen);
 } 
 return true;
};


/** DOMReady */
jQuery(document).ready( function () {
 var istMANVAnsicht = jQuery("body.manv").length; /** im MANV ist das Verfahren / der Selektor ein anderer: alarmierungsanker_".$oeffne_oe."_".$oeffne_bd." */
 var istZuweisungAenderung = (jQuery("body.aktion-change-zuweisung").length > 0);
 
 /** Vorschlag auswerten */
 if (jQuery(SelektorFormularAktiverVorschlag).length) {
  var AnkerSelektor = "a#alarmierungsanker_"; /** instanz+oeid */
  
  var FormularDatenInstanzId = jQuery(SelektorFormularAktiverVorschlag + " input[name='Vorschlag[InstanzId]']").val();
  var FormularDatenOEId = jQuery(SelektorFormularAktiverVorschlag + " input[name='Vorschlag[oe_id]']").val();
  var FormularDatenBdId = jQuery(SelektorFormularAktiverVorschlag + " input[name='Vorschlag[bd_id]']").val();
  
  var OEIdIstLeer = (parseInt(FormularDatenOEId) === 0);
  if (FormularDatenOEId.length && !OEIdIstLeer) { // nur wenn eine OE uebergeben wurde :)
   var ZielAnkerSelektor = AnkerSelektor+FormularDatenInstanzId + "_" + FormularDatenOEId;

   if (istMANVAnsicht) {
    ZielAnkerSelektor = AnkerSelektor + FormularDatenOEId + "_" + FormularDatenBdId;
   }
   
   var ZielAnkerSelektorFallback = "";
   if (jQuery(SelektorFormularAktiverVorschlag + " input[name='Vorschlag[SelektorHint]']").length) {
    ZielAnkerSelektorFallback = jQuery(SelektorFormularAktiverVorschlag + " input[name='Vorschlag[SelektorHint]']").val();
   }
   
   /** bei einer Aenderung brauchen wir eine andere Meldung! Es ist kein Vorschlag mehr! */
   
   if (jQuery(ZielAnkerSelektor).length) {
    jQuery(ZielAnkerSelektor).click();
   } else if (jQuery(ZielAnkerSelektorFallback).length) { 
   jQuery(ZielAnkerSelektorFallback).click();
   } else if ((FormularDatenBdId.length === 0) || (parseInt(FormularDatenBdId) === 0)) {
    if (istZuweisungAenderung) {
     alert("Durch die Änderung kann die bestehende Behandlungseinrichtung nicht mehr ausgewählt werden. Sie können eine neue Behandlungseinrichtung wählen, die Änderung rückgängig machen oder abbrechen.");
    } else {
     alert($GCS_LOCALE_VORSCHLAG_NICHT_ZUWEISBAR_KEINE_BD);
    }
   } else {
    if (istZuweisungAenderung) {
     alert("Durch die Änderung kann die bestehende Behandlungseinrichtung nicht mehr ausgewählt werden. Sie können eine neue Behandlungseinrichtung wählen, die Änderung rückgängig machen oder abbrechen.");
    } else {
     alert($GCS_LOCALE_VORSCHLAG_NICHT_ZUWEISBAR);
    }    
   }
  }
 }
 
 
 /**
  * ScrollTo
  * @type String
  */
  if (jQuery(scrollToSelektor)) {
   var scrollToValue = jQuery(scrollToSelektor).val();
   if (scrollToValue > 0) {
    jQuery(document).scrollTop(scrollToValue);
   }
  }  
  jQuery(ZertifikatSelektor).click(function(e) { ZertifikatAnzeigen(e); });
 
 /** Alarmierungsansicht blinken */
 if (jQuery("#alarmierungsansicht").length) {
  setInterval(function() {
   var AlleElementeDieBlinkenSollenContainer = jQuery("#alarmierungsansicht tr.pat").not(".pat-e"); // die eingetroffenen sollen nicht blinken
   var BlinkeElemente = jQuery(".Alarmierungshinweis-Blinken", AlleElementeDieBlinkenSollenContainer);
   jQuery(BlinkeElemente).toggleClass("AlarmierungshinweisAus");
  }, 1000);
 }
 
 /** Alle moeglichen akustischen Alarmierungen */
 /** wenn weitere Events alarmiert werden sollen einfach den Selektor hier erweitern */
 var AlleSignaltoene = jQuery(SelektorSignaltonZuweisungsVorschlag+","+SelektorSignaltonMANV);
 IVENAAudioAlarmierung(AlleSignaltoene);
 
 
 /** Autocompleter OE-Suche */
 
 /** erweiterte PZC-Filter-Validierung */
 jQuery(document).on("submit", SelektorZuweisungsformular, function(e) {
  var IstAenderungsformular = (jQuery(SelektorSchalterZuweisungAendernSubmit, e.target).length > 0);
  var ZwischenErgebnis = true;
  
  ZwischenErgebnis = ErweitertePZCFilterPruefung(e);
  if (IstAenderungsformular && ZwischenErgebnis) {
   ZwischenErgebnis = submit_zuweisungsmaske(e); // nach erfolg des AJAX-calls wird submitted
   return false; // wird durch AJAX-call submitted!
  }
  return ZwischenErgebnis;
 });
 /** Ende erweitere PZC-Filter-Validierung */
 
 if (jQuery("#holeVorschlaege").length > 0) {
  var tElement = jQuery("#holeVorschlaege").first();
  var intervallVorschlaege = (tElement.data("intervall"));
  var vorschlag_id = (tElement.data("vorschlag_id"));
  var zuweisung_anderer_disponenten = (tElement.data("zuweisung_anderer_disponenten"));
  var manv_id = (tElement.data("manv_id"));
  setInterval( function() { hole_api_els_vorschlaege(vorschlag_id, zuweisung_anderer_disponenten, manv_id); }, intervallVorschlaege);
 } /* vorschlaege */
 
}); // Ende domReady

/**
 * 
 * @param int InstanzId
 * @param int oe_id
 * @param int bereich_id
 * @param string fb_id
 * @param int bd_id
 * @param string IdKontaktboxContainer
 * @returns {Boolean}
 */
function hole_ls_kontaktbox(InstanzId, oe_id, bereich_id, fb_id, bd_id, IdKontaktboxContainer)
{
 schliesse_alle_infoboxen(IdKontaktboxContainer);
 
 var SelektorIdKontaktbox = "#" + IdKontaktboxContainer;
 var tKontaktboxUrl = 'remote.php?InstanzId='+InstanzId+'&oe_id='+escape(oe_id)+'&bereich_id='+escape(bereich_id)+'&fb_id='+escape(fb_id)+'&view=hole_ls_kontaktbox&bd_id='+escape(bd_id)+'&si='+escape($IVENA_SI)+'&rnd='+String(Math.random());
 
 var KontaktboxContainer = jQuery(SelektorIdKontaktbox);
 var KontaktboxContent = jQuery(SelektorIdKontaktbox).find(".content");
 
 var AnkerElement = KontaktboxContainer.parents("td").children(KontaktBoxAnkerSelektor);
 var AnkerElementContainer = AnkerElement.parents("td");
  
 jQuery.ajax(tKontaktboxUrl).done(function(data) {
  KontaktboxContent.html(data);
  BoxAusrichten(AnkerElementContainer, KontaktboxContainer);
 });
 KontaktboxContent.html($GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL);
 KontaktboxContainer.show();
 BoxAusrichten(AnkerElementContainer, KontaktboxContainer);
 
 return false;
}

var SelektorDiagnoseboxInhalt = DiagnoseBoxSelektor + " .content";
/**
 * 
 * @param string fb_id
 * @param {type} aufrufobjekt
 * @returns {Boolean}
 */
function hole_ls_diagnosebox(fb_id, aufrufobjekt) {
 var Diagnosebox = jQuery(DiagnoseBoxSelektor);
 
 var DiagnoseboxURL = 'remote.php?view=ls_diagnosebox&fb_id='+escape(fb_id)+'&si='+escape($IVENA_SI)+'&rnd='+String(Math.random());
 jQuery.ajax(DiagnoseboxURL).done(function(data) {
  jQuery(SelektorDiagnoseboxInhalt).html(data);
 });
 jQuery(SelektorDiagnoseboxInhalt).html($GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL);
 Diagnosebox.show();
 BoxAusrichten(jQuery(aufrufobjekt).parents("li"), Diagnosebox, "left top", "left bottom", "flipfit");
 return false;
}

var PZCFilterContainerSelektor = "div.pzc-filter-div";
var PZCFilterInputSelektor = PZCFilterContainerSelektor+" input[type='checkbox']";

function SerialisierePZCFilterFormularZuURL() {
 var URL = "";
 
 var Inputs = jQuery(PZCFilterInputSelektor);
 if (Inputs.length > 0) {
  URL = "&"+Inputs.serialize();
 }

 return URL;
}

var SelektorPZCInputs = "[name='PZCsAlarmierung[]']";
var SelektorHinweisAenderung = "div.HinweisZuweisungAenderung";
/*
 * 
 * @edit 2019-05-30: Raphael: filter_url_objekt aus Übergabe ausgebaut und durch SerialisierePZCFilterFormularZuURL ersetzt
 * @edit 2019-05-29: Raphael: Box ausrichten
 * @edit 2014-12-10 Raphael: erweitert um PZC-ID (auf Grundlage derer die PueP-Regeln ermittelt werden)
 * 
 * @param {type} oe_id
 * @param {type} bereich_id
 * @param {type} fb_id
 * @param {type} bd_id
 * @param {type} auswahl_ueber_pzc
 * @param {type} pzc
 * @param {type} vorschlag_id
 * @param {type} zugangspunkt_id
 * @param {type} alarmierungsbox_id
 * @param {type} si
 * @param {type} aufrufobjekt
 * @param {type} pzc_synonym_id
 * @returns {undefined}
 */
function hole_ls_alarmierungsbox(EventTarget, bereich_id, fb_id, bd_id, auswahl_ueber_pzc, pzc, vorschlag_id, zugangspunkt_id, alarmierungsbox_id, pzc_synonym_id, geoservice_rettungsmittel, offset_eintreffzeit, geo_lat, geo_lon, pzc_id, gis_plz, aktion) {
 refresh_blocked = 1;
 schliesse_alle_infoboxen(alarmierungsbox_id);
 
 var HinweisAenderungHeight = 0;
 if (jQuery(SelektorHinweisAenderung).length) {
  HinweisAenderungHeight = (jQuery(SelektorHinweisAenderung).outerHeight(true) + 10); /** die 10px sind arbitraer etwas luft */
 }
 
 jQuery([document.documentElement, document.body]).animate({
    scrollTop: jQuery(EventTarget).offset().top - HinweisAenderungHeight
 }, 0);
 
 if (xhttp_alarmierung) {
  var FilterURL = SerialisierePZCFilterFormularZuURL();
  
  if (geoservice_rettungsmittel === undefined) {
   geoservice_rettungsmittel = "car";
  }
  if (offset_eintreffzeit === undefined) {
   offset_eintreffzeit = 0;
  }
  
  if (geo_lat === undefined) {
   geo_lat = 0;
  }
  if (geo_lon === undefined) {
   geo_lon = 0;
  }
  
  var PZCsSerialisiert = (jQuery(SelektorPZCInputs).serialize());
  var FormularDaten = AktuelleOEZeileFormularDaten(jQuery(EventTarget));
  var OEId = jQuery(FormularDaten).find("input[name='OEId']").val();
  var InstanzId = jQuery(FormularDaten).find("input[name='InstanzId']").val();
  var TemplateId = jQuery(FormularDaten).find("input[name='TemplateId']").val();
  
  xhttp_alarmierung.open('GET', 'ajax_ls_alarmierung.php?TemplateId='+TemplateId+'&InstanzId='+InstanzId+'&oe_id='+escape(OEId)+'&bereich_id='+escape(bereich_id)+'&fb_id='+escape(fb_id)+'&bd_id='+escape(bd_id)+'&auswahl_ueber_pzc='+escape(auswahl_ueber_pzc)+'&pzc='+escape(pzc)+'&vorschlag_id='+escape(vorschlag_id)+'&zugangspunkt_id='+zugangspunkt_id+'&zuweisung_pzc_synonym_id='+pzc_synonym_id+'&geoservice_rettungsmittel='+geoservice_rettungsmittel+'&offset_eintreffzeit='+offset_eintreffzeit+'&geo_lat='+geo_lat+'&geo_lon='+geo_lon+'&pzc_id='+pzc_id+'&si='+escape($IVENA_SI)+FilterURL+'&'+PZCsSerialisiert+'&gis_plz='+gis_plz+'&aktion='+aktion+'&rnd='+String(Math.random()), true);
  div_alarmierungsbox_id = alarmierungsbox_id;
  xhttp_alarmierung.onreadystatechange = zeige_alarmierungsbox_ergebnis;
  xhttp_alarmierung.send('');
  document.getElementById(alarmierungsbox_id).innerHTML = $GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL;
  jQuery("#"+alarmierungsbox_id).parents(AlarmierungsBoxSelektor).show(); // Zuweisungsmaske anzeigen
  var ContainerElement = jQuery("#"+alarmierungsbox_id).closest(AlarmierungsBoxSelektor); // globaler ID-Selektor
  var AnkerElement = ContainerElement.parent("div").children(AlarmierungAnkerSelektor);
  var AnkerElementContainer = AnkerElement.parents("td"); 
  BoxAusrichten(AnkerElementContainer, ContainerElement, "right top", "left bottom", "flip flip");
 }
 return false;
}


function setTimestampEintreffzeit(sender, dest)
{
 var ts = 0;
 var minutes = 0;
 
 var eintreffzeit_select = document.getElementById("zuweisung_eintreffzeit");
 
 var sender_tagname = sender.tagName;
 if (sender_tagname === "SELECT")
 {
  // nehme "diesen Wert"
  minutes = sender.options[sender.selectedIndex].value;
  
 }
 else if (sender_tagname === "INPUT")
 {
  // nehme den Wert aus dem SELECT
  if (sender.value == 0)
  {
   ts = getData(sender, "zuweisung-eintreffzeit");
  }
  else if (sender.value == 1)
  {
   minutes = eintreffzeit_select.options[eintreffzeit_select.selectedIndex].value;
  }
  
 }
 
 if (minutes > 0)
 {
  var d = new Date();
  var newDateObj = new Date(d.getTime() + (minutes * 60000));
  ts = Math.floor((( newDateObj.getTime() ) / 1000)); 
 }
 
 var dest = document.getElementById(dest);
 dest.value = ts;
}

var request_status = null;
/**
 * Holt den Status einer OE
 * 
 * @param {type} $element_destination
 * @param boolean $form_submit
 * @param int $fb_status_alt
 * @returns {undefined}
 */
var zuweisung_fb_status;
function ajax_get_status_zeitleiste($element_destination, $form_submit, e) {
 var parameters = new Array();
 var tc = 0;
 var parameterString = "";
 
 if( null !== request_status )
 {
  request_status.abort();
 }
 else if( null === request_status )
 {
  request_status = get_ajax_request();
 }
 
 if (!$element_destination && e && e.target) { // Fallback zur Sicherheit
  $element_destination = jQuery("<div id='khs-status'></div>").appendTo(jQuery(e.target));
 }
 
 
 if ($form_submit === true)
 {
  // den Status merken
  if (document.getElementsByName("zuweisung[zuweisung_fbstatus]"))
  {
   zuweisung_fb_status = (parseInt(document.getElementsByName("zuweisung[zuweisung_fbstatus]")[0].value) || 0);
  }
 }
 
 show_loading_animation();
 if ($element_destination) {
  $element_destination.innerHTML = $GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL;
 }
 
  // Zuweisung aendern-Schalter deaktivieren
 if (document.getElementById("zuweisung-aendern-submit")) {
  document.getElementById("zuweisung-aendern-submit").disabled = true;
 }
 
 request_status.open("POST", $IVENA_AJAX_ENDPOINT_URL, true);
 request_status.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=iso-8859-1");
 
 request_status.onreadystatechange = function () {
  if (request_status.readyState === 4) {
   hide_loading_animation();
   removeClass($element_destination, "loading");
   var $response = request_status.responseText;
   try
   {
    response = ( typeof(JSON) != 'undefined' ? JSON.parse($response) : eval("(" + $response + ")") );
    if (true /*$response.status === 1*/)
    {
     $element_destination.innerHTML = response.html;
      // Zuweisung aendern-Schalter deaktivieren
      if (document.getElementById("zuweisung-aendern-submit"))
      {
       document.getElementById("zuweisung-aendern-submit").disabled = false;
      }
      
      if ($form_submit === true)
      {
       // $fb_status_alt mit aktuellem Status vergleichen
       var status_neu = (parseInt(response.data.zuweisung_fbstatus) || 0);
       if (status_neu === zuweisung_fb_status)
       {
        // jQuery("#lst-alarmierungseingabe").trigger("submit"); /** submit-handler triggern zB Datenfehler */
        document.getElementById("lst-alarmierungseingabe").submit();
        // return true; // umstellung auf submit-Schalter
       }
       else
       {
        var submit_button = document.getElementById("zuweisung-aendern-submit");
        var action_footer = document.getElementById("change-zuweisung-actions");
        var status_footer = document.getElementById("change-zuweisung-status");

        if (submit_button)
        {
         submit_button.disabled = false;
        }
        if (action_footer)
        {
         removeClass(action_footer, "hide");
        }
        if (status_footer)
        {
         addClass(status_footer, "hide");
        }

        alert($GCS_LOCALE_ALARMIERUNG_ZUWEISUNG_BEARBEITEN_FBSTATUSWECHSEL);
       }
      }
			
     if( "string" === typeof(response.html) )
     {
      var $Response = jQuery("<div>").html(response.html);
      var $StatusFBMitPuePLabel = "" + jQuery(".zeitstrahl-fb-mit-puep-label", $Response).html();
      var $Alarmierungsbox = jQuery($element_destination).closest(".alarmierungsbox");
      jQuery("tr.zeitstrahl-fb-mit-puep-label td.content", $Alarmierungsbox).html($StatusFBMitPuePLabel);
      if( 0 < $StatusFBMitPuePLabel.length )
      {
       jQuery("tr.zeitstrahl-fb-mit-puep-label", $Alarmierungsbox).removeClass("hide");
      }
      else
      {
       jQuery("tr.zeitstrahl-fb-mit-puep-label", $Alarmierungsbox).addClass("hide");
      }
      /** die Zuweisungsmaske muss noch mal neu ausgerichtet werden weil der pup-content die box verschiebt */
      var ContainerElement = jQuery($Alarmierungsbox); // globaler ID-Selektor
      var AnkerElement = ContainerElement.parent("div").children(AlarmierungAnkerSelektor);
      var AnkerElementContainer = AnkerElement.parents("td"); 
      BoxAusrichten(AnkerElementContainer, ContainerElement, "right top", "left bottom", "flipfit");
     }
    }
   }
   catch ($e)
   {
    if ($element_destination) {
     if (request_status.status === 200)
     {
      $element_destination.innerHTML = $GCS_LOCALE_AJAX_REQUEST_ERROR_NO_RESPONSE;
     }
     else
     {
      $element_destination.innerHTML = $GCS_LOCALE_AJAX_REQUEST_ABORT;
     }
    } /* else {
     alert($e);
     console.log($e);
    } */
   }
  }
 };
 
 // alle relevanten Daten einsammeln
	// view (remote.php)
	parameters[tc] = new Array(); parameters[tc][0] = "view"; parameters[tc][1] = "status_zeitleiste"; tc++;
 
	
 // auswahl_ueber_pzc
 var auswahl_ueber_pzc = "";
 if (document.getElementById("change-zuweisung-auswahl-ueber-pzc"))
 {
  auswahl_ueber_pzc = (parseInt(document.getElementById("change-zuweisung-auswahl-ueber-pzc").value) || 0);
 }
 else if (document.getElementById("auswahl_ueber_pzc"))
 {
  auswahl_ueber_pzc = (parseInt(document.getElementById("auswahl_ueber_pzc").value) || 0);
 }
 parameters[tc] = new Array(); parameters[tc][0] = "auswahl_ueber_pzc"; parameters[tc][1] = auswahl_ueber_pzc; tc++;
 
 // OE-ID
 var oe_id = "";
 if (document.getElementById("zuweisung_oe_id"))
 {
  var elem = document.getElementById("zuweisung_oe_id");
  if (elem.tagName === "SELECT")
  {
   oe_id = elem.options[elem.selectedIndex].value;
  }
  else
  {
   oe_id = elem.value;
  }  
 } else if (jQuery("input[name='oe_id']").length > 0) {
  oe_id = jQuery("input[name='oe_id']").val();
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_oe_id]"; parameters[tc][1] = oe_id; tc++;
 // BD-ID
 var bd_id = "";
	var BDID_ELEMENT = jQuery("input[name='zuweisung[zuweisung_bd_id]']");
 if (document.getElementById("zuweisung_bd_id"))
 {
  var elem = document.getElementById("zuweisung_bd_id");
  if (elem.tagName === "SELECT")
  {
   bd_id = elem.options[elem.selectedIndex].value;
  }
  else
  {
   bd_id = elem.value;
  }
 }
	else if (BDID_ELEMENT.length > 0)
	{
		bd_id = BDID_ELEMENT.val();
	}
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_bd_id]"; parameters[tc][1] = bd_id; tc++;
 // PZC
 var pzc = "";
 if (document.getElementsByName("zuweisung[zuweisung_pzc]").length > 0)
 {
  pzc = document.getElementsByName("zuweisung[zuweisung_pzc]")[0].value;
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_pzc]"; parameters[tc][1] = pzc; tc++;
 
 var PZCInputs = jQuery($element_destination).parents("form").find(SelektorPZCInputs); // ueber $element_destination ans Formular
 if (PZCInputs) {
  var PZCListe = jQuery(PZCInputs).serializeArray();
  for (var PZCC = 0; PZCC < PZCListe.length; PZCC++) {
   parameters[tc] = new Array(); parameters[tc][0] = PZCListe[PZCC].name; parameters[tc][1] = PZCListe[PZCC].value; tc++;
  }
 }
 
 // FB
 var fb_id = "";
 if (document.getElementsByName("zuweisung[zuweisung_fb_id]")[0])
 {
  var elem = document.getElementsByName("zuweisung[zuweisung_fb_id]")[0];
  if (elem.nodeName == "SELECT")
  {
   if (elem.selectedIndex != null && elem.selectedIndex >= 0)
   {
    fb_id = elem.options[elem.selectedIndex].value;
   }
  }
  else if (elem.nodeName == "INPUT")
  {
   fb_id = elem.value;
  }
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_fb_id]"; parameters[tc][1] = fb_id; tc++;

 // Alter
 var alter = "";
 if (document.getElementsByName("zuweisung[zuweisung_alter]")[0])
 {
  var elem = document.getElementsByName("zuweisung[zuweisung_alter]")[0];
  if (elem.nodeName == "INPUT")
  {
   alter = elem.value;
  }
  else if (elem.nodeName == "SELECT")
  {
   alter = elem.options[elem.selectedIndex].value;
  }
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_alter]"; parameters[tc][1] = alter; tc++;
 
 // Eintreffzeit
 var eintreffzeit = "";
 if (document.getElementsByName("zuweisung[zuweisung_eintreffzeit]")[0])
 {
  var elem = document.getElementsByName("zuweisung[zuweisung_eintreffzeit]")[0];
  if (elem.nodeName == "INPUT")
  {
   eintreffzeit = elem.value;
  }
  else if (elem.nodeName == "SELECT")
  {
   eintreffzeit = elem.options[elem.selectedIndex].value;
  }
 }
 else if (document.getElementsByName("zuweisung_eintreffzeit")[0]) // altes Format
 {
  var elem = document.getElementsByName("zuweisung_eintreffzeit")[0];
  if (elem.nodeName == "INPUT")
  {
   eintreffzeit = elem.value;
  }
  else if (elem.nodeName == "SELECT")
  {
   eintreffzeit = elem.options[elem.selectedIndex].value;
  }
 }
 
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_eintreffzeit]"; parameters[tc][1] = eintreffzeit; tc++;
 
 // Eintreffzeit (timestamp)
 var eintreffzeit_timestamp = "";
 if (document.getElementsByName("zuweisung[zuweisung_eintreffzeit_timestamp]")[0])
 {
  eintreffzeit_timestamp = document.getElementsByName("zuweisung[zuweisung_eintreffzeit_timestamp]")[0].value;
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_eintreffzeit_timestamp]"; parameters[tc][1] = eintreffzeit_timestamp; tc++;
 
 // Eintreffzeit (Anpassen)
 var zuweisung_eintreffzeit_aendern = 0;
 if (document.getElementsByName("zuweisung[zuweisung_eintreffzeit_aendern]").length > 0)
 {
  var elems = document.getElementsByName("zuweisung[zuweisung_eintreffzeit_aendern]");
  for (var i = 0; i < elems.length; i++)
  {
   if (elems[i].checked === true)
   {
    zuweisung_eintreffzeit_aendern = (parseInt(elems[i].value) || 0);
   }
  }
 }
 else if (document.getElementById("zuweisung_eintreffzeit_aendern"))
 {
  zuweisung_eintreffzeit_aendern = document.getElementById("zuweisung_eintreffzeit_aendern").value;
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_eintreffzeit_aendern]"; parameters[tc][1] = zuweisung_eintreffzeit_aendern; tc++;
 
 
 // PZC-Filter
 var kvpairs_filter = "";
 if (document.getElementById("pzc-filter-change-zuweisung")) {
  kvpairs_filter = jQuery("#pzc-filter-change-zuweisung input").serialize();
 }

 // Quelle + MANV-ID
 var zuweisung_quelle = 1; /* default: Regelversorgung */
 if (document.getElementsByName("zuweisung[zuweisung_quelle]")[0])
 {
  zuweisung_quelle = (parseInt(document.getElementsByName("zuweisung[zuweisung_quelle]")[0].value) || 1);
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_quelle]"; parameters[tc][1] = zuweisung_quelle; tc++;
 
 var MANVId = "";
 if (jQuery("[name='zuweisung[zuweisung_manv_id]']").length) {
  var MANVId = jQuery("[name='zuweisung[zuweisung_manv_id]']").val();
  if (MANVId) {
   if (MANVId.length === 0 && jQuery("[name='aktive_manv_id']")) {
    MANVId = jQuery("[name='aktive_manv_id']").val();
   }
  }
 } else if (jQuery("input[name='aktive_manv_id']").length) {
  MANVId = jQuery("input[name='aktive_manv_id']").val();
 }
 if (MANVId.length) {
  parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_manv_id]"; parameters[tc][1] = MANVId; tc++;
 }
 
 // Zeitstrahl-Parameter
 // MODUS
 var zeitstrahl_modus = "";
 if (document.getElementsByName("zeitstrahl[modus]")[0])
 {
  zeitstrahl_modus = document.getElementsByName("zeitstrahl[modus]")[0].value;
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zeitstrahl[modus]"; parameters[tc][1] = zeitstrahl_modus; tc++;
 
 // Vergangenheit
 var zeitstrahl_vergangenheit = 0;
 if (document.getElementsByName("zeitstrahl[offset_vergangenheit]")[0])
 {
  zeitstrahl_vergangenheit = (parseInt(document.getElementsByName("zeitstrahl[offset_vergangenheit]")[0].value) || 0);
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zeitstrahl[offset_vergangenheit]"; parameters[tc][1] = zeitstrahl_vergangenheit; tc++;
 
 // Zukunft
 var zeitstrahl_zukunft = 0;
 if (document.getElementsByName("zeitstrahl[offset_zukunft]")[0])
 {
  zeitstrahl_zukunft = (parseInt(document.getElementsByName("zeitstrahl[offset_zukunft]")[0].value) || 0);
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zeitstrahl[offset_zukunft]"; parameters[tc][1] = zeitstrahl_zukunft; tc++;
 
 // anderer Verbleib (MANV)
 if (jQuery("[name='zuweisung[zuweisung_anderer_verbleib]']").length) {
  var andererVeribleib = jQuery("[name='zuweisung[zuweisung_anderer_verbleib]']").val();
  parameters[tc] = new Array(); parameters[tc][0] = "zuweisung[zuweisung_anderer_verbleib]"; parameters[tc][1] = andererVeribleib; tc++;
 }
 
 // Bezugszeitpunkt
 // zeitstrahl[timestamp_bezugszeitpunkt]
 var zeitstrahl_timestamp_bezugszeitpunkt = 0;
 if (document.getElementsByName("zeitstrahl[timestamp_bezugszeitpunkt]")[0]) {
  zeitstrahl_timestamp_bezugszeitpunkt = (parseInt(document.getElementsByName("zeitstrahl[timestamp_bezugszeitpunkt]")[0].value) || 0);
 }
 parameters[tc] = new Array(); parameters[tc][0] = "zeitstrahl[timestamp_bezugszeitpunkt]"; parameters[tc][1] = zeitstrahl_timestamp_bezugszeitpunkt; tc++;
 
 parameters[tc] = new Array(); parameters[tc][0] = "zeitstrahl[modus]"; parameters[tc][1] = "klein"; tc++;

 // SI
 parameters[tc] = new Array(); parameters[tc][0] = "si"; parameters[tc][1] = $IVENA_SI; tc++;

 // DEBUG
 parameters[tc] = new Array(); parameters[tc][0] = "XDEBUG_SESSION_START"; parameters[tc][1] = "netbeans-xdebug";
 tc++;
 
 // Random
 parameters[tc] = new Array(); parameters[tc][0] = "rnd"; parameters[tc][1] = String(Math.random());
 tc++;
 
 
 // Parameter konkatenieren
 for (var i = 0; i < parameters.length; i++) {
  parameterString += (i > 0 ? "&" : "") + (parameters[i][0] + "=" + encodeURI(parameters[i][1]));
 }
 
 if (kvpairs_filter.length > 0) {
  parameterString = parameterString + "&" + kvpairs_filter;
 }
 
 request_status.send(parameterString);
}

var SelektorKHSStatusById = "#khs-status";
var SelektorZuweisungAendernSubmitById = "#zuweisung-aendern-submit";
var SelektorZuweisungAendernById = "#zuweisung-aendern";
var SelektorZuweisungAendernFormularById = "form#lst-alarmierungseingabe";
var SelektorZuweisungAendernFormularAlleInputs = SelektorZuweisungAendernFormularById + " :input";
var SelektorPZCAuswahlAenderungsmaske = "#change-zuweisung-pzc-container select";
var SelektorPZCFilterAenderungsmaske = SelektorZuweisungAendernById + " #pzc-filter-change-zuweisung input[type='checkbox']";
var SelektorenAenderungsMaske = SelektorZuweisungAendernById + " select[name='zuweisung[zuweisung_oe_id]'] , " + SelektorPZCAuswahlAenderungsmaske + "," + SelektorZuweisungAendernById + " [name='zuweisung[zuweisung_bd_id]'] " + "," + SelektorZuweisungAendernById + " [name='zuweisung[zuweisung_fb_id]'] " + "," + SelektorPZCFilterAenderungsmaske ;

jQuery(document).on("change", SelektorenAenderungsMaske, function(e) {
 ajax_get_zuweisungsmaske(jQuery(e.target).parents(SelektorZuweisungAendernById));
});


var request_zuweisungsmaske = null;
/**
 * 
 * @param {type} $element_destination
 * @returns {undefined}
 */
function ajax_get_zuweisungsmaske($element_destination) {
 var FormularSerialisiert = jQuery(SelektorZuweisungAendernFormularById).serialize();
 
 request_zuweisungsmaske = jQuery.ajax($IVENA_AJAX_ENDPOINT_URL, {
  data: FormularSerialisiert,
  beforeSend: function() {
   if (request_zuweisungsmaske !== null) {
    request_zuweisungsmaske.abort();
   }
   show_loading_animation();
   jQuery(SelektorZuweisungAendernFormularAlleInputs).prop("disabled", true);
   jQuery(SelektorKHSStatusById).replaceWith($GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL);
   jQuery(SelektorZuweisungAendernSubmitById).hide();
  },
  error: function() {
   
  }
 }).done( function(data) {
  hide_loading_animation();
  jQuery(SelektorZuweisungAendernSubmitById).show();
  jQuery($element_destination).replaceWith(data);
 });
}

/**
 * 
 * @edit 2019-05-30: Raphael: filter_url_objekt aus Übergabe ausgebaut und durch SerialisierePZCFilterFormularZuURL ersetzt
 * 
 * @param {type} oe_id
 * @param {type} aktive_manv_id
 * @param {type} bd_id
 * @param {type} auswahl_ueber_pzc
 * @param {type} pzc
 * @param {type} vorschlag_id
 * @param {type} alarmierungsbox_id
 * @param {type} si
 * @param {type} aufrufobjekt
 * @param {type} pzc_synonym_id
 * @returns {undefined}
 */
function hole_manv_alarmierungsbox(event, oe_id, aktive_manv_id, bd_id, auswahl_ueber_pzc, pzc, vorschlag_id, alarmierungsbox_id, si, aufrufobjekt, pzc_synonym_id, zugangspunkt_id, InstanzId, TemplateId, manv_zuweisung_kontext, aktion)
{
 var ParentBoxId = jQuery("#"+alarmierungsbox_id).parents(".alarmierungsbox").attr("id");
 refresh_blocked = 1;
 schliesse_alle_infoboxen(ParentBoxId);
 if (xhttp_alarmierung) {
  var FilterURL = SerialisierePZCFilterFormularZuURL();
  
  if (manv_zuweisung_kontext.length > 0) {
   TemplateId = "";
  }
  xhttp_alarmierung.open('GET', 'ajax_manv_alarmierung.php?oe_id='+escape(oe_id)+'&InstanzId='+InstanzId+'&TemplateId='+TemplateId+'&aktive_manv_id='+escape(aktive_manv_id)+'&bd_id='+escape(bd_id)+'&auswahl_ueber_pzc='+escape(auswahl_ueber_pzc)+'&pzc='+escape(pzc)+'&zuweisung_pzc_synonym_id='+pzc_synonym_id+'&vorschlag_id='+escape(vorschlag_id)+'&si='+escape(si)+FilterURL+'&zugangspunkt_id='+zugangspunkt_id+'&kontext='+manv_zuweisung_kontext+'&aktion='+aktion+'&rnd='+String(Math.random()), true);
  div_alarmierungsbox_id = alarmierungsbox_id;
  xhttp_alarmierung.onreadystatechange = zeige_alarmierungsbox_ergebnis;
  xhttp_alarmierung.send('');
  var Alarmierungsbox = jQuery("#"+alarmierungsbox_id).parents(".alarmierungsbox");
  var AusrichtenAn = jQuery(event.target).parents("td");
  document.getElementById(alarmierungsbox_id).innerHTML = $GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL;
  Alarmierungsbox.show();
  BoxAusrichten(AusrichtenAn , Alarmierungsbox, "right top", "left bottom", "fit");
 }
}

/**
 * 
 * @returns {undefined}
 */
var SelektorAutocompleteFunkrufname = "input[name='zuweisung_funkrufname'].autocomplete";
var SelektorZeitstrahl = "input[name^='Zeitleiste[']";
var SelektorPrimaereZeitleisten = ".ZeitleisteJSON";
var SelektorContainerZeitstrahlStatusZuweisung = "[name='ContainerZeitstrahlStatus']";

var cacheAutocomplete = {};
function zeige_alarmierungsbox_ergebnis() {
 if (xhttp_alarmierung.readyState == 4)  {
  var ContainerElement = jQuery("#"+div_alarmierungsbox_id).closest(AlarmierungsBoxSelektor); // globaler ID-Selektor
  var AnkerElement = ContainerElement.parent("div").children(AlarmierungAnkerSelektor);
  var AnkerElementContainer = AnkerElement.parents("td");
  document.getElementById(div_alarmierungsbox_id).innerHTML = xhttp_alarmierung.responseText;
  div_alarmierungsbox_id = ""; // globaler ID-Selektor wird zurückgesetzt...
  if( document.getElementById('loadAJAXJS') )
	 {
		 eval( document.getElementById('loadAJAXJS').innerHTML );
	 }
  BoxAusrichten(AnkerElementContainer, ContainerElement, "right top", "left bottom", "flipfit flipfit");
  /** Autocompleter */
  
  jQuery(SelektorAutocompleteFunkrufname).autocomplete({
    source: function( request, response ) {
         var term = request.term;
         if ( term in cacheAutocomplete ) {
           response( cacheAutocomplete[ term ] );
           return;
         }
         jQuery.getJSON( $IVENA_AJAX_ENDPOINT_URL+"?si="+$IVENA_SI+"&view=funkrufname_autocomplete", request, function( data, status, xhr ) {
           cacheAutocomplete[ term ] = data;
           response( data );
         });
        },
    minLength: 1,
    select: function( event, ui ) {
     jQuery(SelektorAutocompleteFunkrufname).val(ui.item.value);
    }
  });

  /** kopieren des Zustands Zeitstrahl in die Zuweisung */
  var Zeitleisten = jQuery(SelektorPrimaereZeitleisten); /* .slice(0, 6)*/;
  jQuery(SelektorContainerZeitstrahlStatusZuweisung).val(Zeitleisten.clone().text());

  /** im MANV bei Zuweisungs-Vorschlag / Ueberfuehren einer Zuweisung: Zeitstrahl-Status checken */
  var SelektorMANV = "input[name='aktive_manv_id']";
  var SelektorEintreffzeitContainer = ".eintreffzeit-container";
  if (jQuery(SelektorMANV, ContainerElement).length && jQuery(SelektorEintreffzeitContainer, ContainerElement).length) { // wir sind in der MANV-Zuweisungsmaske
   /* console.log(jQuery(SelektorMANV, ContainerElement)); */
   ajax_get_status_zeitleiste(document.getElementById("khs-status"));
  }
  
  change_sekundaeranlass(document.getElementById("zuweisung_anlass")); /* nach dem ajax den anlass noch mal triggern */
 }
}

/**
 * Aufruf Zuweisungsliste
 * 
 * @edit 2019-10-18: Raphael: ueberschuessige Parameter entfernt
 * @edit 2019-05-30: Raphael: filter_url_objekt aus Übergabe ausgebaut und durch SerialisierePZCFilterFormularZuURL ersetzt
 * 
 * @param {type} oe_id
 * @param {type} bereich_id
 * @param {type} fb_id
 * @param {type} bd_id
 * @param {type} manv_id
 * @param {type} auswahl_ueber_pzc
 * @param {type} pzc
 * @param {type} vorschlag_id
 * @param {type} quelle
 * @param {type} von
 * @param {type} bis
 * @param {type} nur_aktive
 * @param {type} ansicht
 * @param {type} plbx_id
 * @returns {undefined}
 */
function hole_plbx_oe_bd_manv(InstanzId, oe_id, bereich_id, fb_id, bd_id, manv_id, auswahl_ueber_pzc, pzc, vorschlag_id, quelle, von, bis, nur_aktive, ansicht, plbx_id, manv_kontext)
{
 schliesse_alle_infoboxen(plbx_id);
 /* alle anderen Patientenlisten ausblenden... */
 if (typeof PATIENTENLISTE_CONTAINER !== "undefined") {
  jQuery(PATIENTENLISTE_CONTAINER).not("#"+plbx_id).hide();
 }
 
 var FilterURL = SerialisierePZCFilterFormularZuURL();

 var tCallback = zeige_plbx_ergebnisJSON;
 var tView = "ajaxpatientenliste"; /** hausbezug */
 var tSucheBD = "";
 if (manv_kontext && manv_kontext.length > 0) {
  tView = "disposition"; /** manv-bezug prozessschritt */
  if (manv_kontext === "verstorben") { // umformen auf 'alle mit SK6'
   tSucheBD = "&disposition_suche[bd][]=6";
   manv_kontext = "alle";
  } else if (manv_kontext === "unverletzt_betroffen") { // umformen auf 'alle mit SK6'
   tSucheBD = "&disposition_suche[bd][]=8";
   manv_kontext = "alle";
  }
 }

 refresh_blocked = 1;

 var PatientenlisteURL = 'remote.php?view='+tView+'&InstanzId='+InstanzId+'&oe_id='+escape(oe_id)+'&bereich_id='+escape(bereich_id)+'&fb_id='+escape(fb_id)+'&bd_id='+escape(bd_id)+'&manv_id='+escape(manv_id)+'&auswahl_ueber_pzc='+escape(auswahl_ueber_pzc)+'&pzc='+escape(pzc)+'&vorschlag_id='+escape(vorschlag_id)+'&quelle='+escape(quelle)+'&von='+escape(von)+'&bis='+escape(bis)+'&nur_aktive='+escape(nur_aktive)+'&ansicht='+escape(ansicht)+'&si='+escape($IVENA_SI)+FilterURL+'&disposition_suche[oe]=&disposition_suche[kontext]=liste&disposition_suche[anzeige]=manv&disposition_suche[prozessschritt][]='+manv_kontext+tSucheBD+'&rnd='+String(Math.random());
 // 2x done um den redundanten Code der Callbacks abzuarbeiten
 jQuery.ajax(PatientenlisteURL).done(tCallback).done(function() {
  PatienlisteAusrichten(div_plbx_id);
  div_plbx_id = ""; // globale Variable! (wird hier "unsettet")
 });
 div_plbx_id = plbx_id;

 document.getElementById(plbx_id).innerHTML = $GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL;
 jQuery("#"+plbx_id).closest(".patientenliste-container").show();
 PatienlisteAusrichten(plbx_id);
 return false;
}

/**
 * Callback Patientenliste HTML
 * @deprecated since 4.3.71 kommt ab sofort auch per json
 * @param {type} data
 * @returns {undefined}
 */
function zeige_plbx_ergebnis(data) {
 document.getElementById(div_plbx_id).innerHTML = data;
}

/**
 * Callback Patientenliste JSON
 * @param {type} data
 * @returns {undefined}
 */
function zeige_plbx_ergebnisJSON(data) {
 document.getElementById(div_plbx_id).innerHTML = data.data.patientenliste;
}

/**
	* 
	* @param {type} PatienlisteIDSelektor
	* @returns {undefined}
	*/
function PatienlisteAusrichten(PatienlisteIDSelektor) {
	/** Patientenliste ausrichten */
		var PatientenListeSelector = "#"+PatienlisteIDSelektor;
		var PatientenListeParent = jQuery(PatientenListeSelector).closest("div.patientenliste-container");
		var ParentAnker = jQuery(PatientenListeSelector).closest("td");
		if (ParentAnker.length === 0) {
			ParentAnker = jQuery(PatientenListeSelector).closest("th");  /** im MANV kann es ein th sein! */
		}
		
		if (ParentAnker.length > 0 && PatientenListeParent.length > 0) {
   BoxAusrichten(ParentAnker, PatientenListeParent, "left top", "right bottom", "none none");
		}
}

/**
	* 
	* @param {type} si
	* @param {type} $vorschlag_id
	* @returns {undefined}
	*/
var AktuellerVorschlagRequestIstFertig = true;
function hole_api_els_vorschlaege($vorschlag_id, VorschlaegeAndererDisponentenAnzeigen, MANVId) {
 var URLVorschlag = 'remote.php?view=ajax_get_api_els_vorschlaege&si='+escape($IVENA_SI)+'&vorschlag_id='+escape($vorschlag_id)+'&VorschlaegeAndererDisponenten='+VorschlaegeAndererDisponentenAnzeigen+'&manv_id='+MANVId+'&'+$IVENA_AUTOREFERESH_PARAMETER+'&rnd='+String(Math.random());
 
 if (AktuellerVorschlagRequestIstFertig) {
  jQuery.ajax(URLVorschlag).done(function(data) {
   zeige_api_els_vorschlaege(data);
   AktuellerVorschlagRequestIstFertig = true;
  }).always(function() {
   hide_loading_animation();
  });
  show_loading_animation();

  AktuellerVorschlagRequestIstFertig = false;
 }
}

/**
 * 
 * @returns {Boolean}
 */
function zeige_api_els_vorschlaege(data) {
 jQuery(SelektorELSAPI).replaceWith(jQuery.parseHTML(data));

 /** wenn es weitere audio-tags gibt bitte einfach den selektor ergaenzen! */
 var AlleSignaltoene = jQuery(SelektorSignaltonZuweisungsVorschlag);
 IVENAAudioAlarmierung(AlleSignaltoene);
}


/**
 * 
 * @param {type} $vorschlag_id
 * @returns {undefined}
 */
var SelektorELSAPI = "#api-els";
function loesche_api_els_vorschlag( $vorschlag_id ) {
 var loeschen_bestaetigen = confirm($GCS_LOCALE_VORSCHLAG_LOESCHEN);
 var VorschlagLoeschenURL = 'remote.php?view=vorschlag_loeschen&si='+escape($IVENA_SI)+'&zuweisung_id='+escape($vorschlag_id)+'&rnd='+String(Math.random());

 if (loeschen_bestaetigen) {
  jQuery.ajax(VorschlagLoeschenURL).done(function(data) {
   jQuery(SelektorELSAPI).replaceWith(jQuery.parseHTML(data));
   reset_doubleclick_watcher();
  }).always(function() {
   hide_loading_animation();
  });
  show_loading_animation();
 }  
}

/**
 * @edit 2019-09-06: Raphael: Patientenlisten ausblenden
 * @param {string} except diese Box offenhalten (ID-Vergleich!)
 * @returns {undefined}
 */
function schliesse_alle_infoboxen(except) {
 var temp_string = "";
 
 // DOM-Elemente suchen
 if (document.getElementsByClassName)
 {
  var kontaktboxen = document.getElementsByClassName('kontaktbox');
  var diagnoseboxen = document.getElementsByClassName('diagnosebox');
  var plbxen = document.getElementsByClassName('plbx');
  var alarmierungsboxen = document.getElementsByClassName('alarmierungsbox');
  var transparent_layer = document.getElementsByClassName("layer_transparent");
 }
 else
 {
  i=0;
  var kontaktboxcounter=0;
  var diagnoseboxcounter=0;
  var plbxcounter=0;
  var alarmierungsboxcounter=0;
  var temp=document.getElementsByTagName('div');
  var kontaktboxen=new Array();
  var diagnoseboxen=new Array();
  var plbxen=new Array();
  var alarmierungsboxen=new Array();
  while (temp[i]) 
  {
   if (temp[i].className == "kontaktbox") 
   {
	kontaktboxen[kontaktboxcounter]=temp[i];
	kontaktboxcounter++;
   }
   if (temp[i].className == "diagnosebox") 
   {
	diagnoseboxen[diagnoseboxcounter]=temp[i];
	diagnoseboxcounter++;
   }
   if (temp[i].className == "plbx") 
   {
	plbxen[plbxcounter]=temp[i];
	plbxcounter++;
   }
   if (temp[i].className == "alarmierungsbox") 
   {
	alarmierungsboxen[alarmierungsboxcounter]=temp[i];
	alarmierungsboxcounter++;
   }
   i++;
  }
 }
 
 // Ausblenden (via display none)
 for (var i = 0; i < kontaktboxen.length; i++)
 {
  if (kontaktboxen[i].id != except)
  {
   kontaktboxen[i].style.display = 'none';
  }
 }
 for (var i = 0; i < diagnoseboxen.length; i++)
 {
  if (diagnoseboxen[i].id != except)
  {
   diagnoseboxen[i].style.display = 'none';
  }
 }
 for (var i = 0; i < plbxen.length; i++)
 {
  if (plbxen[i].id != except)
  {
   plbxen[i].style.display = 'none';
  }
 }
 for (var i = 0; i < alarmierungsboxen.length; i++) {
  if (alarmierungsboxen[i].id != except) {
   alarmierungsboxen[i].style.display = 'none';
   // 30.4.2012, Gerrit:
   // Wenn eine Alarmierungsbox geöffnet, geschlossen und danach eine darunter liegende(!) Alarmierungsbox geöffnet wurde,
   // konnte diese nicht mehr abgeschickt werden: Die vorher geöffnete verwendet die gleichen IDs, daher beziehen sich alle
   // Operationen auf diese vorher geöffnete (was i.d.R. zu einem Prüffehler beim Formular geführt hat).
   // Es reicht also nicht, die Alarmierungsbox unsichtbar zu machen, sondern ihr Inhalt (beginnt mit der ID "alarmierungsbox_") 
   // muss geleert werden.
   temp_string=alarmierungsboxen[i].id;
   temp_string=temp_string.replace(/alarmierung_/, 'alarmierungsbox_');
   if (temp_string.length > 0 && (document.getElementById(temp_string))) { /** 2020-01: Raphael: es gibt mittlerweile Alarmierungsboxen ohne ID */
   document.getElementById(temp_string).innerHTML="";
  }
 }
 }
 for (var i = 0; i < transparent_layer.length; i++) {
  if (transparent_layer[i].id != except) {
    transparent_layer[i].style.display = 'none';
   }
  }
  
 jQuery(".patientenliste-container").hide();
}

/**
 * 
 * @param {type} pzc
 * @returns {Boolean}
 */
function datenfehler_pzc(pzc) {
 if (pzc.value.length != 6) { 
  alert($GCS_LOCALE_PZC_ERROR_6STELLIG);
  pzc.focus();
  return false;
 }
 else if (isNaN(pzc.value))
 {
  alert($GCS_LOCALE_PZC_ERROR_NURZAHLEN);
  pzc.focus();
  return false;
 }
 else if ((pzc.value.substr(5,1) != 1) && (pzc.value.substr(5,1) != 2) && (pzc.value.substr(5,1) != 3))
 {
  alert($GCS_LOCALE_PZC_ERROR_BDID);
  pzc.focus();
  return false;
 }
 
 /** Die Synonymsuche ist vorhanden: Prüfen ob gueltige BD uebermittelt wurde */
 if (document.getElementById("pzc_synonymsuche_anzeigen") !== undefined)
 {
  var temp_bd_id = parseInt(pzc.value.substr(5,1));
  if (!isNaN(temp_bd_id))
  {
   var auswaehlbar = PZC_BD_AUSWAEHLBAR[temp_bd_id];
   if (!auswaehlbar)
   {
    alert($GCS_LOCALE_PZC_ERROR_BDID_SYNONYM);
    return false;
   }
  }
 }
}

/**
 * 
 * @param {type} status_grund_id
 * @param {type} status_person
 * @param {type} status_bemerkung
 * @param {type} status_email_senden
 * @returns {Boolean}
 */
function datenfehler_ablehnung(status_grund_id, status_person, status_bemerkung, status_email_senden)
{
 if ((status_grund_id=='2') && (!(document.getElementById('ablehnung_grund_id').value.length > 3)))
 { 
  alert($GCS_LOCALE_ABLEHNUNG_ERROR_GRUND);
  reset_doubleclick_watcher();
  return false;
 }
 if ((status_person=='2') && (!(document.getElementById('ablehnung_person').value.length > 3)))
 { 
  alert($GCS_LOCALE_ABLEHNUNG_ERROR_PERSON);
  reset_doubleclick_watcher();
  return false;
 }
 if ((status_bemerkung=='2') && (!(document.getElementById('ablehnung_bemerkung').value.length > 3)))
 { 
  alert($GCS_LOCALE_ABLEHNUNG_ERROR_BEMERKUNG);
  reset_doubleclick_watcher();
  return false;
 }
 return true;
}

/**
 * X_XX_XX_XXXX also: 1 Ziffer, Leerzeichen, 2 Buchstaben, Leerzeichen, 2 Ziffern, Leerzeichen, 4 Ziffern
 * @param string PLTNr
 * @returns bool
 */
function IstGueltigePLTNr(PLTNr) {
 if (PLTNr) {
  PLTNr = PLTNr.replace(/ /g, ""); // alle whitespaces entfernen
  var RegexPLT = /(\d{1})([a-z]{2})(\d{6})/ig;
 
  var IstGueltig = (PLTNr.length === 9);
  IstGueltig = IstGueltig && (RegexPLT.test(PLTNr));
  return IstGueltig;
 }
 return false;
}

/**
 * Führt die clientseitige Datenfehlerprüfung des Zuweisungsobjektes aus
 * 
 * Gibt im Fehlerfall einen Alert aus
 * 
 * 30.05.2017: Raphael: Erweotert um template_definition um die Aufrufparameter drastisch zu verringern
 * 
 * @param array template_definition In diesem Array sollten sich Objekte nach folgendem Schema befinden: 
 * string element_id
 * int template_status = 0=nicht vorhanden|1=optional|2=pflicht
 * string error_text Der Fehlertext, der bei fehlender Angabe für dieses Feld ausgegeben werden soll
 * string form_type
 * 
 * @param {type} status_eintreffzeit
 * @param {type} status_schockraumres
 * @param {type} status_herzkatheterres
 * @param {type} status_anlass
 * @param {type} status_arbeitsunfall
 * @param {type} status_geschlecht
 * @param {type} status_alter
 * @param {type} status_reanimation
 * @param {type} status_beatmet
 * @param {type} status_schwanger
 * @param {type} status_schock
 * @param {type} status_lyse
 * @param {type} status_infektioes
 * @param {type} status_arztbegleitet
 * @param {type} status_grund
 * @param {type} status_transportmittel
 * @param {type} status_enr
 * @param {type} status_freitext
 * @param {type} status_pzc
 * @param {type} status_tel
 * @param {type} status_patient_id
 * @param {type} status_kfz_kennzeichen
 * @param {type} status_funkrufname
 * @param {type} status_pager_ausloesen
 * @param {type} status_fb
 * @param {type} status_vak_nr
 * @param {type} status_kis_nr
 * @returns {Boolean}
 */
function datenfehler_alarmierung(template_definition, status_eintreffzeit, status_schockraumres, status_herzkatheterres, status_anlass, status_arbeitsunfall, status_geschlecht, status_alter, status_reanimation, status_beatmet, status_schwanger, status_schock, status_lyse, status_infektioes, status_arztbegleitet, status_grund, status_transportmittel, status_enr, status_freitext, status_pzc, status_tel, status_patient_id, status_kfz_kennzeichen, status_funkrufname, status_pager_ausloesen, status_fb, status_vak_nr, status_kis_nr, sender)
{
 if (isNaN(status_fb) || (typeof status_fb === 'undefined') ) { status_fb = 1; }

 if ((status_eintreffzeit=='2') && (!(document.getElementById('zuweisung_eintreffzeit').value > 0)))
 { 
  alert($GCS_LOCALE_ALARMIERUNG_ERROR_EINTREFFZEIT);
  reset_doubleclick_watcher();
  return false;
 }
// Wenn Schockraumreservierung ein Pflichtfeld ist
if ((status_schockraumres=='2') && ((!(document.getElementById('zuweisung_schockraumres_0').checked)) && (!(document.getElementById('zuweisung_schockraumres_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_SCHOCKRAUMALARM);
 reset_doubleclick_watcher();
 return false;
}
// Wenn Herztkatheterreservierung ein Pflichtfeld ist
if ((status_herzkatheterres=='2') && ((!(document.getElementById('zuweisung_herzkatheterres_0').checked)) && (!(document.getElementById('zuweisung_herzkatheterres_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_HERZKATHETERALARM);
 reset_doubleclick_watcher();
 return false;
}

// Wenn Anlass ein Pflichtfeld ist
var SekundaerAnlassIstBefuellt = false;
if ((status_anlass=='2') && (!(document.getElementById('zuweisung_anlass').value > 0)) && SKIP_DATENFEHLER_ANLASS !== true)
{
 var SekundaerAnlassElement = (jQuery("select[name='zuweisung_sekundaeranlass_id']"));
 if (SekundaerAnlassElement) {
  SekundaerAnlassIstBefuellt = (SekundaerAnlassElement.val() != 0);
 }
 if (!SekundaerAnlassIstBefuellt) {
  alert($GCS_LOCALE_ALARMIERUNG_ERROR_ANLASS);
  reset_doubleclick_watcher();
  return false;
 } 
}
// Wenn Arbeitsunfall ein Pflichtfeld ist
if ((status_arbeitsunfall=='2') && ((!(document.getElementById('zuweisung_arbeitsunfall_0').checked)) && (!(document.getElementById('zuweisung_arbeitsunfall_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_ARBEITSUNFALL);
 reset_doubleclick_watcher();
 return false;
}

// Wenn Geschlecht ein Pflichtfeld ist
if (status_geschlecht == '2') {
 /** neue Variante: suche ueber den Container wegen nichtbinaerer Geschlechtsidentitaet */
 var SelektorGeschlecht = ".feld-15 input[type='radio']:checked";
 var GeschlechtSelektiert = jQuery(SelektorGeschlecht).val();
 
 if (isNaN(GeschlechtSelektiert)) {
  alert($GCS_LOCALE_ALARMIERUNG_ERROR_GESCHLECHT);
  reset_doubleclick_watcher();
  return false;
 } 
}

// Wenn Altersgruppe ein Pflichtfeld ist
if (((status_alter=='2') && (!(document.getElementById('zuweisung_alter').value >= 0)))
  || ((status_alter=='2') && (document.getElementById('zuweisung_alter').value == ''))
 )
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_ALTER);
 reset_doubleclick_watcher();
 return false;
}
// Wenn Reanimation ein Pflichtfeld ist
if ((status_reanimation=='2') && ((!(document.getElementById('zuweisung_reanimation_0').checked)) && (!(document.getElementById('zuweisung_reanimation_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_REANIMATION);
 reset_doubleclick_watcher();
 return false;
}
// Wenn Beatmet ein Pflichtfeld ist
if ((status_beatmet=='2') && ((!(document.getElementById('zuweisung_beatmet_0').checked)) && (!(document.getElementById('zuweisung_beatmet_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_BEATMET);
 reset_doubleclick_watcher();
 return false;
}
// Wenn Schwanger ein Pflichtfeld ist
if ((status_schwanger=='2') && ((!(document.getElementById('zuweisung_schwanger_0').checked)) && (!(document.getElementById('zuweisung_schwanger_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_SCHWANGER);
 reset_doubleclick_watcher();
 return false;
}
// Wenn Schock ein Pflichtfeld ist
if ((status_schock=='2') && ((!(document.getElementById('zuweisung_schock_0').checked)) && (!(document.getElementById('zuweisung_schock_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_SCHOCK);
 reset_doubleclick_watcher();
 return false;
}
// Wenn Lyse ein Pflichtfeld ist
if ((status_lyse=='2') && ((!(document.getElementById('zuweisung_lyse_0').checked)) && (!(document.getElementById('zuweisung_lyse_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_LYSE);
 reset_doubleclick_watcher();
 return false;
}
// Wenn Infektiös ein Pflichtfeld ist
//  if ((status_infektioes=='2') && ((!(document.getElementById('zuweisung_infektioes_0').checked)) && (!(document.getElementById('zuweisung_infektioes_1').checked))))
if ((status_infektioes=='2') && (!(document.getElementById('zuweisung_infektioes').value > 0)))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_INFEKTIOES);
 reset_doubleclick_watcher();
 return false;
}
// Wenn arztbegleitet ein Pflichtfeld ist
if ((status_arztbegleitet=='2') && ((!(document.getElementById('zuweisung_arztbegleitet_0').checked)) && (!(document.getElementById('zuweisung_arztbegleitet_1').checked))))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_ARZTBEGLEITET);
 reset_doubleclick_watcher();
 return false;
}

// Wenn Tel ein Pflichtfeld ist
if ((status_tel=='2') && (!(document.getElementById('zuweisung_tel').value.length > 0)))
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_TELEFONNUMMER);
 reset_doubleclick_watcher();
 return false;
}

// Wenn Zuweisungskriterium ein Pflichtfeld ist
if (((status_grund=='2') && (!(document.getElementById('zuweisung_grund').value > 0)))
  || ((status_grund=='2') && (document.getElementById('zuweisung_grund').value == ''))
 )
{ 
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_ZUWEISENDESTELLE);
 reset_doubleclick_watcher();
 return false;
}

// Wenn Transportmittel ein Pflichtfeld ist
if ((status_transportmittel == "2") && (!(document.getElementById('zuweisung_transportmittel').value > 0))) {
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_TRANSPORTMITTEL);
 reset_doubleclick_watcher();
 return false;
}
// Wenn ENR ein Pflichtfeld ist
if (status_enr == "2") {
 var ElementENR = document.getElementById('zuweisung_enr');
 if (!ElementENR) {
  ElementENR = jQuery("input[name='zuweisung_enr']");
 }
 
 if (ElementENR) {
  var ENRWert = jQuery(ElementENR).val();
  if (ENRWert.length === 0) {
   alert($GCS_LOCALE_ALARMIERUNG_ERROR_ENR);
   reset_doubleclick_watcher();
   return false;
  }
 }
}
// Wenn Freitext ein Pflichtfeld ist
if ((status_freitext == "2") && (!(document.getElementById('zuweisung_freitext').value.length > 0))) {
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_BEMERKUNG);
 reset_doubleclick_watcher();
 return false;
}

// Wenn PZC ein Pflichtfeld ist
if (status_pzc == "2") {
 if (jQuery("#zuweisung_pzc").length) {
  if (!(document.getElementById('zuweisung_pzc').value.length == 3)) {
   alert($GCS_LOCALE_ALARMIERUNG_ERROR_PZC);
   reset_doubleclick_watcher();
   return false;
  }
 }
}

// VAK-Nr.:
if (status_vak_nr == "2") {
 if (jQuery("#zuweisung_vak_nr").length) {
  if (!(document.getElementById('zuweisung_vak_nr').value.length > 0)) {
   alert($GCS_LOCALE_ALARMIERUNG_ERROR_VAK_NR);
   reset_doubleclick_watcher();
   return false;
  }
 }
}

// KIS-Nr.:
if ((status_kis_nr == '2') && (!(document.getElementById('zuweisung_kis_nr').value.length > 0))) {
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_KIS_NR);
 reset_doubleclick_watcher();
 return false;
}

// Wenn KFZ-Kennezeichen ein Pflichtfeld ist
if ((status_kfz_kennzeichen == '2') && (!(document.getElementById('zuweisung_kfz_kennzeichen').value.length > 0))) {
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_KFZKENNZEICHEN);
 reset_doubleclick_watcher();
 return false;
}

// Wenn funkrufname ein Pflichtfeld ist
if ((status_funkrufname == '2') && (!(document.getElementById('zuweisung_funkrufname').value.length > 0))) {
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_FUNKRUFNAME);
 reset_doubleclick_watcher();
 return false;
}

/* Sonderfall fuer Aenderungsmaske: FB-Status abfragen (wenn gesperrt: keine Zuweisung) */
if (status_fb === 0) {  // Keine Versorgung
 alert($GCS_LOCALE_ALARMIERUNG_ERROR_FBSTATUS);
 reset_doubleclick_watcher();
 return false;
}

// dynamische Zuweisungsfelder
var template_def_count = template_definition.length;
if (template_def_count > 0)
{
 for (var akt_i = 0; akt_i < template_def_count; akt_i++)
 {
  var datenfehler_ergebnis = true;
  var NullWertZulaessig = false;
  
  var akt_obj = template_definition[akt_i];
  
  var element_name = akt_obj.element_name;
  var element_ext_name = akt_obj.element_ext_name;
  var element_id = akt_obj.element_id;
  var form_elements = document.getElementsByName(element_name); // liefert alle!
  var element_error_text = $GCS_LOCALE_ALARMIERUNG_ERROR_ZUWEISUNGSFELD_ALLGEMEIN + element_ext_name;

  var istPrimaerAnlass = (element_name === "zuweisung_anlass_id");
  
  // 0 bedeutet: Nicht vorhanden
  // 1 bedeutet: Vorhanden
  // 2 bedeutet: Pflichtfeld
  var optional_pflicht = isNaN(parseInt(akt_obj.template_status)) ? 0 : parseInt(akt_obj.template_status);
  
  // Sonderbehandlung
  if (((element_name === "zuweisung_sekundaeranlass_id" || element_name === "APIZuweisung[feld][zuweisung_sekundaeranlass_id]") && SKIP_DATENFEHLER_SEKANLASS === true) ||
   ((element_name === "zuweisung_anlass_id" || element_name === "APIZuweisung[feld][zuweisung_anlass_id]") && SKIP_DATENFEHLER_ANLASS === true)) {
   optional_pflicht = 0;
  }
  
  if (istPrimaerAnlass && SekundaerAnlassIstBefuellt) {
   optional_pflicht = 0;
  }
  
  if (element_name === "APIZuweisung[feld][zuweisung_alter]" || element_name === "zuweisung_alter") {
   NullWertZulaessig = true;
  }
  
  if ((element_name === "zuweisung_plt_nr" || element_name === "zuweisung[zuweisung_plt_nr]")) {
   /** PLT-Nummer validieren */
   if (optional_pflicht === 2) { /** wenn Pflichtfeld */
    if (jQuery(form_elements).val().length === 0) {
     alert(element_error_text);
     reset_doubleclick_watcher();
     return false;
    }
   }
   
   var esIstEinWertFuerPLTeingegeben = (jQuery(form_elements).length && jQuery(form_elements).val().length > 0);
   
   if (esIstEinWertFuerPLTeingegeben) {
   /** ansonsten wenn etwas drin steht */
    WertIstGueltigePLT = IstGueltigePLTNr(jQuery(form_elements).val());
    if (!WertIstGueltigePLT) {
     alert("Die PLT/PLS-Nummer ist im falschen Format (1 Ziffer, 2 Buchstaben, 2 Ziffern, 4 Ziffern)");
     reset_doubleclick_watcher();
     return false;
    }
   }
  }
  
  if (optional_pflicht === 2 && form_elements.length > 0) // nur ein Pflichtfeld muss abgeprueft werden
  {
   var element_form_type = akt_obj.form_type;
   if (true) // Selektor prüfen
   {
    
    // Unterschiedliche Behandlung der Formularfelder, datenfehler_ergebnis setzen
    if (element_form_type === "text") {
     if (form_elements.value) {
      if (form_elements.value.length === 0) {
       datenfehler_ergebnis = false;
      }
     } else if (form_elements.length > 0) {
      jQuery(form_elements).each(function(index) {
       if (form_elements[index].value.length === 0) {
        datenfehler_ergebnis = false;
       }
      });
     }     
    } else if (element_form_type === "radio") {
     datenfehler_ergebnis = (jQuery(form_elements).filter(":checked").length > 0);
    } else if (element_form_type === "select") {
     var is_selected = false;
     
     for (var ti = 0; ti < form_elements.length; ti++) {
      if (form_elements[ti].options) {
       if (form_elements[ti].options[form_elements[ti].selectedIndex]) {
        var IstZahl = parseInt(form_elements[ti].options[form_elements[ti].selectedIndex].value);
        if (isNaN(IstZahl)) { /** Textfeld */
         if (form_elements[ti].options[form_elements[ti].selectedIndex].value.length > 0) {
          is_selected = true;
         }
        } else {
         if (form_elements[ti].options[form_elements[ti].selectedIndex].value > 0) {
          is_selected = true;
         } else if (IstZahl === 0 && NullWertZulaessig) {
          is_selected = true;
         }
        }
       } else { // z. B. disabled hat selectedIndex -1
        //console.debug(form_elements[ti]);
        //console.debug(form_elements[ti].options);
       }
      } else { // das select hat keine optionen!?
       is_selected = true;
      }
     }
     datenfehler_ergebnis = is_selected;
    }
    
    if (datenfehler_ergebnis === false) {
     alert(element_error_text);
     reset_doubleclick_watcher();
     return false;
    }
    
   }
  }
 }
}
// Ende dynamische Zuweisungsfelder

//  Eintreffzeit pruefen (derzeit nur praxen!)
// console.log(jQuery("#khs-status input[name='zuweisung[oe_typ]']"));
var istPraxis = (parseInt(jQuery("#khs-status input[name='zuweisung[oe_typ]']").val()) === 3);
if (istPraxis) {
 var OEStatus = jQuery("#khs-status input[name='zuweisung[zuweisung_fbstatus]']");
 if (OEStatus.length) { // nur wenn wir einen definierten Status haben ueberpruefen wir
  var AktuellerStatusEintreffzeit = parseInt(OEStatus.val());
  var EintreffzeitIstVersorgtOderGesperrt = ((AktuellerStatusEintreffzeit === 1) || (AktuellerStatusEintreffzeit === 2));
  if (!EintreffzeitIstVersorgtOderGesperrt) {
   alert($GCS_LOCALE_ALARMIERUNG_FEHLER_EINTREFFZEIT_GESCHLOSSEN);
   return false;
  }
 }
}

/** wenn eine MFID da ist wird das Format geprueft */
var MFIdInput = jQuery(SelektorMFIdInputText);
if (MFIdInput.length > 0) {
 var eingegebeneMFId = MFIdInput.val();
 var MFIdLaenge = eingegebeneMFId.length;
 if (MFIdLaenge > 0) {
  var LaengeIstRichtig = (MFIdLaenge === 27);
  if (!LaengeIstRichtig) {
   alert($GCS_LOCALE_ALARMIERUNG_FEHLER_MFID_LAENGE);
   return false;
  }
 }
}

return true;
}


 
/**
 * Wird bei der Auswahl eines Vorschlags ausgeführt und füllt die Alarmierungsansicht
 * mit vordefinierten Daten, die wir aus dem Data-Attribut <zuweisung> erhalten.
 * 
 * @param {element} sender
 * @returns {Boolean}
 */
function uebernehme_vorschlag_zuweisung( sender ) {
	var $formular	= document.getElementById( "lst-alarmierungseingabe" );
	var $value		= sender.options[sender.options.selectedIndex].value;
 
 var AlarmierungsBoxInhalt = jQuery(sender).parents("div.content");
 var AnkerContainer = AlarmierungsBoxInhalt.parents("td");
 var Anker = AnkerContainer.find("a.alarmierung-anker");
 var AlarmierungsBox = AlarmierungsBoxInhalt.parents("div.alarmierungsbox");
 
 jQuery.ajax({
  url: "ajax_ls_alarmierung.php",
  data: jQuery($formular).serialize(),
  method: "POST"
 }).done(function(e) {
  AlarmierungsBoxInhalt.html(jQuery.parseHTML(e));
  BoxAusrichten(AnkerContainer, AlarmierungsBox, "right top", "left bottom", "fit fit");
  return true;
 }).always(function() {
  hide_loading_animation();
 });
 
 AlarmierungsBoxInhalt.html($GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE);
 show_loading_animation();
 BoxAusrichten(AnkerContainer, AlarmierungsBox, "right top", "left bottom", "fit fit");
 return true;
}


/**
 * Setzt den Wert für ein beliebiges Feld. Dabei wird zuerst herausgefunden, um
 * welchen Typ von Feld es sich handelt. (input[hidden], select, input[radio], ...)
 * Daraufhin werden entsprechende Helfer-Funktionen aufgerufen die alle Möglichkeiten
 * durchlaufen und ggf. einen Wert markieren/eintragen, sofern der Eintrag existert,
 * das Feld beschrieben werden darf etc...
 * 
 * @param {element} element
 * @param {mixed} value
 * @returns {void}
 */
function set_value_for_form_element( element, value )
 {
	if( "undefined" === typeof(element) )
	 {
		return false;
	 }

	if( (1 < element.length) && "INPUT" == element[0].tagName && ("radio" == element[0].type) )
	 {
		set_optiongroup_selection_with_value( element, value );
	 }
	else if( (1 < element.length) && "INPUT" == element[0].tagName && ("checkbox" == element[0].type) )
	 {
		// Checkboxen sind nicht implementiert...
		//set_optiongroup_selection_with_value( element, value );
	 }
	else if( (1 == element.length) && "INPUT" == element.tagName && ("checkbox" == element.type) )
	 {
		if( value == element.value )	 { element.checked = true; }
		else							 { element.checked = false; }
	 }
	else if( "SELECT" == element.tagName )
	 {
		set_selection_with_value( element, value );
    if ("function" === typeof(element.onchange) )
    {
     element.onchange();
    }
	 }
	else if( "INPUT" == element.tagName )
	 {
		element.value = value;
	 }
 }

/**
 * Helferfunktion zur vollautomatischen Formularfüllung
 * 
 * Arbeitet mit einem <select>-Element und durchläuft jede Option, die es finden
 * kann, vergleicht es mit dem vorgegebenen <value> und entfall sie übereinstimmen
 * wird der Wert ausgewählt und die Funktion beendet.
 * 
 * @param {element} element
 * @param {mixed} value
 * @returns {Boolean}
 */
function set_selection_with_value( element, value )
 {
	if( undefined == element || !element )
	 {
		return false;
	 }
	 
	var tmpOptionen = element.options;
	for( i=0; i<tmpOptionen.length; i++ )
	 {
		if( value == tmpOptionen[i].value )
		 {
			tmpOptionen[i].selected = true;
		 }
		else if( true == tmpOptionen[i].checked )
		 {
			tmpOptionen[i].checked = false;	
		 }
	 }
 }

/**
 * Helferfunktion zur vollautomatischen Formularfüllung
 * 
 * Arbeitet mit einem <input[type=radio]>-Element und durchläuft jede Option, die es finden
 * kann, vergleicht es mit dem vorgegebenen <value> und entfall sie übereinstimmen
 * wird der Wert ausgewählt und die Funktion beendet.
 * 
 * @param {element} elements
 * @param {mixed} value
 * @returns {Boolean}
 */
function set_optiongroup_selection_with_value( elements, value )
 {
	if( undefined == elements || !elements )
	 {
		return false;
	 }

	for( i=0; i<elements.length; i++ )
	 {
		if( value == elements[i].value )
		 {
			elements[i].checked = true;
		 }
		else if( true == elements[i].checked )
		 {
			elements[i].checked = false;	
		 }
	 }
 }

/**
 * Holt die Zuweisungen auf dem Zeitstrahl
	* 
 * @param {type} event
 * @param {type} $oeid
 * @param {type} $zeitfenster
 * @returns {undefined}
 */
function hz_oe( event, InstanzId, $oeid, $zeitfenster )
{
 var ZuweisungenURL = 'remote.php?si='+escape($IVENA_SI)+'&view=zuweisungen_oe_zeitstrahl&InstanzId='+InstanzId+'&oe_id='+escape($oeid)+'&zeitfenster='+escape($zeitfenster)+'&rnd='+String(Math.random());
	
	var $div_object =  false;
 var SelektorPatientenlisteOE = "#patientenliste_" + $oeid;
 var PatientenlisteOE = jQuery(SelektorPatientenlisteOE);
 if (PatientenlisteOE.length > 0) {
  $div_object = PatientenlisteOE.get(0);
 }
 
 var $response_container = PatientenlisteOE.children(".content").get(0);
 jQuery($response_container).empty();
 jQuery($response_container).html($GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE_SMALL);
 
	if( $div_object ) {
  /* alle anderen Patientenlisten ausblenden... */
  if (typeof PATIENTENLISTE_CONTAINER !== "undefined") {
   jQuery(PATIENTENLISTE_CONTAINER).not($div_object).hide();
  }
		
		$div_object.style.display = 'block';
  BoxAusrichten(jQuery(event.target), jQuery($div_object), "center top", "center bottom", "fit none"); // vs. flip

  jQuery.ajax(ZuweisungenURL).done(function(data) {
   jQuery($response_container).empty();
   
   if( $response_container ) {
    jQuery($response_container).html(data);
    if (data.error && data.err_html) {
     jQuery($response_container).append(data.err_html);
    }
    BoxAusrichten(jQuery(event.target), jQuery($div_object), "center top", "center bottom", "fit none");     
   }
  });
 }
 return false;
}
 
/* -----------------------------------------------------------------------------
	IVENA Geoservices
----------------------------------------------------------------------------- */
var $ivenaMap = null;
var $attachedResizeHandler = false;
function openMap( dialog_box, sender ) {
	if( "inline" === dialog_box ) {
		automatische_aktualisierung_unterbrechen();
		
		$ivenaMapFrame = document.getElementById("ivena-map-iframe");
		$ivenaMapFrame.style.visibility = 'hidden';
		$ivenaMapFrame.src = sender.href + $map_oeliste;

		resizeInlineMap();
		if( !$attachedResizeHandler ) {
			addIVENAListener("resize", window, resizeInlineMap);
			$attachedResizeHandler = true;
		}

		return false;
	}
	else
	{
		$ivenaMap = window.open(sender.href, "IVENA eHealth - Map", "width=800,height=600,scrollbars=0,toolbars=0,status=0,menubar=1").focus();
		return false;
	}
}
 
function closeMap(window) {
	var $ivenaMapInline = document.getElementById("ivena-map-inline");
	if( $ivenaMapInline ) {
		refresh_blocked = 0;
		$ivenaMapInline.style.display = 'none';
	 } else if (window !== undefined) {
    window.close();
   }
 }

function resizeInlineMap(event) {
	$ivenaMapInline = document.getElementById("ivena-map-inline");
	$ivenaMapInline.style.display = 'block';
		
	/* Größe automatisch auf 80% Seitenbreite/Höhe festlegen */
	var $breite = parseInt( 0.8*Math.max(document.documentElement["clientWidth"], document.body["offsetWidth"], document.documentElement["offsetWidth"]) ); /* , document.body["scrollWidth"], document.documentElement["scrollWidth"] */
	var $hoehe = parseInt( 0.8*Math.max(document.documentElement["clientHeight"], document.body["offsetHeight"], document.documentElement["offsetHeight"]) ); /* , document.body["scrollHeight"], document.documentElement["scrollHeight"] */
		
	var $marginLeft = $breite / 2;
	var $marginTop = $hoehe / 2;
		
	$ivenaMapInline.style.width = $breite + 'px';
	$ivenaMapInline.style.height = $hoehe + 'px';
		
	$ivenaMapInline.style.marginLeft = '-' + $marginLeft + 'px';
	$ivenaMapInline.style.marginTop = '-' + $marginTop + 'px';
 }

function hole_api_geoservice( $aktion, $referenzpunkt, $oe_liste, $view )
{
	if( xhttp_api_geoservice )
	{
		xhttp_api_geoservice.open('GET', 'ajax_geoservice.php?aktion='+escape($aktion)+'&referenzpunkt='+escape($referenzpunkt)+'&oe_liste='+escape($oe_liste)+'&si='+escape($IVENA_SI)+'&rnd='+String(Math.random()), true);
		xhttp_api_geoservice.onreadystatechange = function()
		{
			if (xhttp_api_geoservice.readyState == 4) 
			{
				var $response = xhttp_api_geoservice.responseText;
				$response = ( typeof(JSON) != 'undefined' ? JSON.parse($response) : eval("(" + $response + ")") );

				var $tmp_geoservice_oe_box = null;
				
				// Ergebnis ohne Fehler erhalten:
				if( 0 === $response.status )
				{
					if( "berechne_oeliste" == $aktion && $response.oeliste.length > 0 )
					{
						for( $i=0; $i<$response.oeliste.length; $i++ )
						{
							if( 0 === $response.oeliste[$i].status )
							{
								$tmp_geoservice_oe_box = document.getElementById( "geoservice_" + $response.oeliste[$i].oe_id );
								if( $response.oeliste[$i].zeit !== $response.oeliste[$i].entfernung )
								{
									$tmp_geoservice_oe_box.getElementsByClassName("text")[0].innerHTML = $response.oeliste[$i].zeit + "<br />" + $response.oeliste[$i].entfernung;
								}
								else
								{
									$tmp_geoservice_oe_box.getElementsByClassName("text")[0].innerHTML = $response.oeliste[$i].zeit;
								}
							
								$tmp_geoservice_oe_box.getElementsByClassName("gewichtung")[0].className = $tmp_geoservice_oe_box.getElementsByClassName("gewichtung")[0].className.replace(/level-[1-9]/gi, "level-" + $response.oeliste[$i].gewichtung);
							}
						}
					}
				}
			}
		};
		xhttp_api_geoservice.send('');
	}
}

/**
 * Bestaetigt eine Zuweisung (z. B. aus einer API)
 * 
 * @param {object} $
 * @returns {void}
 */
function ajax_zuweisung_bestaetigen( $po_sender, $po_object )
{
 var xhttp_zuweisung_bestaetigen = false;
 try // IE6
 {
  xhttp_zuweisung_bestaetigen=new ActiveXObject('Msxml2.XMLHTTP');
 }
 catch(e)
 {
  try // IE5
  {
   xhttp_zuweisung_bestaetigen=new ActiveXObject('Microsoft.XMLHTTP');
  }
  catch(e)
  {
   try // Mozilla
   {
    xhttp_zuweisung_bestaetigen=new XMLHttpRequest();
   }
   catch(e) 
   {
    // Kein xhttp-Objekt vorhanden
   }
  }
 }

 if( xhttp_zuweisung_bestaetigen )
  {
   xhttp_zuweisung_bestaetigen.open('GET', 'remote.php?view=zuweisung_bestaetigen&si='+escape($po_object['si'])+'&zuweisung_id='+escape($po_object['zuweisung_id'])+'&rnd='+String(Math.random()), true);
   xhttp_zuweisung_bestaetigen.onreadystatechange = function()
   {
     if(xhttp_zuweisung_bestaetigen.readyState == 4 && xhttp_zuweisung_bestaetigen.status == 200)
      {
       var $response = xhttp_zuweisung_bestaetigen.responseText;
       try
        {
         $response = ( typeof(JSON) !== 'undefined' ? JSON.parse($response) : eval("(" + $response + ")") );

         // JSON response:
         if( $response.status === 0 && $response.count_results == 1 ) // Alles ist okay, Inhalt anzeigen:
          {
			unbestaetigte_zuweisungen--;
			if(unbestaetigte_zuweisungen == 0)
			{
			   removeAnimationObject(animationZuweisungenSchnittstellen);
			   removeClass(document.getElementById('zuweisungen_aus_schnittstellen'), "animation");
			}
           $po_sender.style.display = 'none';
           document.getElementById('lade_'+$po_sender.id).style.display = 'none';
           document.getElementById('erfolg_'+$po_sender.id).style.display = '';
           document.getElementById('bestaetigt_um_'+$po_object['zuweisung_id']).innerHTML = $response.bestaetigung.bestaetigung_bestaetigungsdatum.substr(11,5) + ' Uhr';
           var ext_zuweisung_anzahl_total = parseInt(document.getElementById("externe_zuweisungen_aus_schnittstellen_anzahl").innerHTML);
           var best_neu = ext_zuweisung_anzahl_total - unbestaetigte_zuweisungen;
           document.getElementById("externe_zuweisungen_aus_schnittstellen_anzahl_bestaetigt").innerHTML = best_neu;
          }
          else if( $response.status === 0 && $response.count_results == 0 )
          {
           document.getElementById('lade_'+$po_sender.id).style.display = 'none';
           document.getElementById('fehler_'+$po_sender.id).style.display = '';
          }
         else
          {
           document.getElementById('lade_'+$po_sender.id).style.display = 'none';
           document.getElementById('fehler_'+$po_sender.id).style.display = '';
          }
        }
       catch( $e )
        {
        }
      }
      else if(xhttp_zuweisung_bestaetigen.readyState == 2)
      {
       $po_sender.style.display = 'none';
       document.getElementById('lade_'+$po_sender.id).style.display = '';
      }
   };
   xhttp_zuweisung_bestaetigen.send('');
   $po_sender.style.display = 'none';
   document.getElementById('lade_'+$po_sender.id).style.display = '';
  }
}


function automatische_aktualisierung_unterbrechen() {
 refresh_blocked = 1;
}
 
function automatische_aktualisierung_aktivieren() {
 refresh_blocked = 0;
}

var alarmierungsansicht_bestaetigung = null;
var SelektorToken = "[name='Alarmierungsansicht[Token]']";
/**
 * 2021-07-02: Raphael: kann jetzt alternativ auch die ankunft bestätigen.
 * @param {type} $ps_zuweisung_id
 * @param {type} $pb_ankunft_bestaetigen
 * @returns {Boolean}
 */
function alarmierung_bestaetigen( $Sender, $ps_zuweisung_id, $pb_ankunft_bestaetigen )
{
	if( "undefined" === typeof($ps_zuweisung_id) )
	{
		return false;
	}
	var ViewAlarmierungBestaetigen = "alarmierungsbestaetigung";
 var IDSelektorErgebnisZiel = "alarmierungsbestaetigung_" + $ps_zuweisung_id;
 if ($pb_ankunft_bestaetigen === true) {
  ViewAlarmierungBestaetigen = "update_zuweisung_ankunft";
  // IDSelektorErgebnisZiel = "";
 }
 
	show_loading_animation();
	
	var alarmierungsansicht_bestaetigung = get_ajax_request();
	if( alarmierungsansicht_bestaetigung )
	{
  var Token = "";
  if (jQuery(SelektorToken).length > 0) {
   Token = jQuery(SelektorToken).val();
  }
		alarmierungsansicht_bestaetigung.open('GET', 'remote.php?si='+escape($IVENA_SI)+'&Alarmierungsansicht[Token]='+Token+'&view='+ViewAlarmierungBestaetigen+'&zuweisung_id='+escape($ps_zuweisung_id)+'&rnd='+String(Math.random()), true);
		alarmierungsansicht_bestaetigung.onreadystatechange = function()
		{
			if(alarmierungsansicht_bestaetigung.readyState === 4)
			 {
				var $response = alarmierungsansicht_bestaetigung.responseText;
				hide_loading_animation();
				try
				{
					$response = ( typeof(JSON) !== 'undefined' ? JSON.parse($response) : eval("(" + $response + ")") );
					var $td_parent = document.getElementById(IDSelektorErgebnisZiel);
					var $messageDiv = document.createElement("span");
					
					// JSON response:
					if( $response.errno === 0 ) // Alles ist okay, Inhalt anzeigen:
					{
						$messageDiv.innerHTML = $response.data;
						$td_parent.replaceChild($messageDiv, $Sender);
					}
					else
					{
						// Es ist ein Fehler aufgetreten:
						if( $response.errnr !== 0 && $response.error !== "" )
						{
							$messageDiv.innerHTML = $response.error;
							$td_parent.replaceChild($messageDiv, $Sender);
						}
					}
				}
				catch( $e )
				{
					if( alarmierungsansicht_bestaetigung.status === 200 )
					{
						//alert( "Es ist ein unerwarteter Fehler aufgetreten.\nHTTP Fehlercode: "  );
					}
					else
					{
						//alert( "Die Anfrage wurde abgebrochen" );
					}
				}
			}
		};
		alarmierungsansicht_bestaetigung.send('');
	}
}

/**
 * Führt die Datenfehler-Pruefung selbststaendig aus (fuer AJAX)
 * fuer Aenderungs-Formular
 * 
 * @returns {undefined}
 */
function datenfehler_zuweisungsmaske()
{
 // SKIP_DATENFEHLER_ANLASS
 // und
 // SKIP_DATENFEHLER_SEKANLASS
 // neu setzen
 if (document.getElementById("zuweisung_anlass"))
 {
  if (parseInt(document.getElementById("zuweisung_anlass").value) > 0)
  {
   SKIP_DATENFEHLER_SEKANLASS = true;
  }
 }
 
 if (document.getElementById("zuweisung_sekundaeranlass_id"))
 {
  if (parseInt(document.getElementById("zuweisung_sekundaeranlass_id").value) > 0)
  {
   SKIP_DATENFEHLER_ANLASS = true;
  }
 }

 
 // Die Eintreffzeit muss nicht mehr angegeben werden (bei einer Aenderung)
 var status_eintreffzeit = 0; //document.getElementsByName("template[zuweisung_eintreffzeit]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_eintreffzeit]")[0].value) || 0) : 0;
 var status_schockraumres = document.getElementsByName("template[zuweisung_schockraumres]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_schockraumres]")[0].value) || 0) : 0;
 var status_herzkatheterres = document.getElementsByName("template[zuweisung_herzkatheterres]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_herzkatheterres]")[0].value) || 0) : 0;
 var status_anlass = document.getElementsByName("template[zuweisung_anlass]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_anlass]")[0].value) || 0) : 0;
 if (SKIP_DATENFEHLER_ANLASS === true)
 {
  status_anlass = 0;
 }
 var status_arbeitsunfall = document.getElementsByName("template[zuweisung_arbeitsunfall]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_arbeitsunfall]")[0].value) || 0) : 0;
 var status_geschlecht = document.getElementsByName("template[zuweisung_geschlecht]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_geschlecht]")[0].value) || 0) : 0;
 var status_alter = document.getElementsByName("template[zuweisung_alter]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_alter]")[0].value) || 0) : 0;
 var status_reanimation = document.getElementsByName("template[zuweisung_reanimation]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_reanimation]")[0].value) || 0) : 0;
 var status_beatmet = document.getElementsByName("template[zuweisung_beatmet]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_beatmet]")[0].value) || 0) : 0;
 var status_schwanger = document.getElementsByName("template[zuweisung_schwanger]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_schwanger]")[0].value) || 0) : 0;
 var status_schock = document.getElementsByName("template[zuweisung_schock]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_schock]")[0].value) || 0) : 0;
 var status_lyse = document.getElementsByName("template[zuweisung_lyse]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_lyse]")[0].value) || 0) : 0;
 var status_infektioes = document.getElementsByName("template[zuweisung_infektioes]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_infektioes]")[0].value) || 0) : 0;
 var status_arztbegleitet = document.getElementsByName("template[zuweisung_arztbegleitet]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_arztbegleitet]")[0].value) || 0) : 0;
 var status_grund = document.getElementsByName("template[zuweisung_grund]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_grund]")[0].value) || 0) : 0;
 var status_transportmittel = document.getElementsByName("template[zuweisung_transportmittel]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_transportmittel]")[0].value) || 0) : 0;
 var status_enr = document.getElementsByName("template[zuweisung_enr]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_enr]")[0].value) || 0) : 0;
 var status_freitext = document.getElementsByName("template[zuweisung_freitext]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_freitext]")[0].value) || 0) : 0;
 var status_pzc = document.getElementsByName("template[zuweisung_pzc]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_pzc]")[0].value) || 0) : 0;
 var status_tel = document.getElementsByName("template[zuweisung_tel]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_tel]")[0].value) || 0) : 0;
 var status_patient_id = document.getElementsByName("template[zuweisung_patient_id]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_patient_id]")[0].value) || 0) : 0;
 var status_kfz_kennzeichen = document.getElementsByName("template[]").length > 0 ? (parseInt(document.getElementsByName("template[]")[0].value) || 0) : 0;
 var status_funkrufname = document.getElementsByName("template[zuweisung_funkrufname]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_funkrufname]")[0].value) || 0) : 0;
 var status_pager_ausloesen = 0; //document.getElementsByName("template[zuweisung_pager_ausloesen]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_pager_ausloesen]")[0].value) || 0) : 0;
 var status_fb = document.getElementsByName("zuweisung[zuweisung_fbstatus]").length > 0 ? (parseInt(document.getElementsByName("zuweisung[zuweisung_fbstatus]")[0].value) || 0) : 0;
 
 // VAK-Nr.
 var status_vak = document.getElementsByName("template[zuweisung_vak_nr]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_vak_nr]")[0].value) || 0) : 0;
 
 // KIS-Nr.
 var status_kis = document.getElementsByName("template[zuweisung_kis_nr]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_kis_nr]")[0].value) || 0) : 0;
 
 // Sonderschockraum template[zuweisung_sonderschockraum]
 var status_sonderschockraum = document.getElementsByName("template[zuweisung_sonderschockraum]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_sonderschockraum]")[0].value) || 0) : 0;
 
 // ABCD
 var status_abcd_a = document.getElementsByName("template[zuweisung_airway]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_airway]")[0].value) || 0) : 0;
 var status_abcd_b = document.getElementsByName("template[zuweisung_breathing]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_breathing]")[0].value) || 0) : 0;
 var status_abcd_c = document.getElementsByName("template[zuweisung_circulation]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_circulation]")[0].value) || 0) : 0;
 var status_abcd_d = document.getElementsByName("template[zuweisung_disability]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_disability]")[0].value) || 0) : 0;
 
 // Sekundaeranlass
 var status_sekanlass = document.getElementsByName("template[zuweisung_sekundaeranlass]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_sekundaeranlass]")[0].value) || 0) : 0;
 if (SKIP_DATENFEHLER_SEKANLASS === true)
 {
  status_sekanlass = 0;
 }
 var status_pltnr = document.getElementsByName("template[zuweisung_plt_nr]").length > 0 ? (parseInt(document.getElementsByName("template[zuweisung_plt_nr]")[0].value) || 0) : 0;
 
 /** @todo unter dem selektor #oe-template z. B. im MANV ist eigentlich die vollstaendige template-definition hinterlegt */
 var datenfehler_objekt = [];
 datenfehler_objekt.push({"element_name": "zuweisung[zuweisung_sonderschockraum_id]", "element_ext_name": "Schockraum-Art", template_status: status_sonderschockraum, "form_type": "select"});
 datenfehler_objekt.push({"element_name": "zuweisung[zuweisung_airway_id]", "element_ext_name": "(ABCD) - A: Airway\/Atemweg", template_status: status_abcd_a, "form_type": "select"});
 datenfehler_objekt.push({"element_name": "zuweisung[zuweisung_breathing_id]", "element_ext_name": "(ABCD) - B: Breathing\/Beatmung", template_status: status_abcd_b, "form_type": "select"});
 datenfehler_objekt.push({"element_name": "zuweisung[zuweisung_circulation_id]", "element_ext_name": "(ABCD) - C: Circulation\/Kreislauf", template_status: status_abcd_c, "form_type": "select"});
 datenfehler_objekt.push({"element_name": "zuweisung[zuweisung_disability_id]", "element_ext_name": "(ABCD) - D: Disability\/neurologisches Defizit", template_status: status_abcd_d, "form_type": "select"});
 datenfehler_objekt.push({"element_name": "zuweisung[zuweisung_sekundaeranlass_id]", "element_ext_name": "Sekundäranlass", template_status: status_sekanlass, "form_type": "select"});
 datenfehler_objekt.push({"element_name": "zuweisung[zuweisung_plt_nr]", "element_ext_name": "PLT-Nr.", template_status: status_pltnr, "form_type": "text"});
 
 var ergebnis = datenfehler_alarmierung(datenfehler_objekt, status_eintreffzeit, status_schockraumres, status_herzkatheterres, status_anlass, status_arbeitsunfall, status_geschlecht, status_alter, status_reanimation, status_beatmet, status_schwanger, status_schock, status_lyse, status_infektioes, status_arztbegleitet, status_grund, status_transportmittel, status_enr, status_freitext, status_pzc, status_tel, status_patient_id, status_kfz_kennzeichen, status_funkrufname, status_pager_ausloesen, status_fb, status_vak, status_kis);
 return ergebnis;
}


/**
 * JS-Implementierung der PZC-Filter-GUI
 * für steuernde Kriterien
 * 
 * @param {type} sender
 * @returns {undefined}
 */
var filter_status = {}; /* Speichern des initialen Status */
function pzc_filter(sender) {
 var akt_filter_id = parseInt(getData(sender, "filterid")) || 0;
 var akt_checked = sender.checked;
 
 switch (akt_filter_id) {
  
  /** Intensivpflichtig -> RA + BA deaktivieren */
  case 230:
   if (akt_checked === true)
   {
    document.getElementsByName("pzcfilter[220]")[0].checked = false; // RA
    document.getElementsByName("pzcfilter[220]")[0].disabled = true; // RA
    
    document.getElementsByName("pzcfilter[210]")[0].checked = false; // BA
    document.getElementsByName("pzcfilter[210]")[0].disabled = true; // BA
   }
   else
   {
    if (parseInt(getData(document.getElementsByName("pzcfilter[220]")[0], "auswaehlbar")) > 0)
    {
     document.getElementsByName("pzcfilter[220]")[0].checked = false;
     document.getElementsByName("pzcfilter[220]")[0].disabled = false;
    }
    
    if (parseInt(getData(document.getElementsByName("pzcfilter[210]")[0], "auswaehlbar")) > 0)
    {
     document.getElementsByName("pzcfilter[210]")[0].checked = false;
     document.getElementsByName("pzcfilter[210]")[0].disabled = false;
    }
   }
  break;
  
  /** Reanimiert -> Int deaktivieren, Beatmet selektieren (und disablen) */
  case 220:
   if (akt_checked === true)
   {
    document.getElementsByName("pzcfilter[230]")[0].checked = false; // Int
    document.getElementsByName("pzcfilter[230]")[0].disabled = true; // Int
    
    if (parseInt(getData(document.getElementsByName("pzcfilter[210]")[0], "auswaehlbar")) > 0)
    {
     document.getElementsByName("pzcfilter[210]")[0].checked = true; // BA
     document.getElementsByName("pzcfilter[210]")[0].disabled = true; // BA
    }
   }
   else
   {
    if (parseInt(getData(document.getElementsByName("pzcfilter[230]")[0], "auswaehlbar")) > 0)
    {
     document.getElementsByName("pzcfilter[230]")[0].checked = false; // Int
     document.getElementsByName("pzcfilter[230]")[0].disabled = false; // Int
    }
    
    if (parseInt(getData(document.getElementsByName("pzcfilter[210]")[0], "auswaehlbar")) > 0)
    {
     document.getElementsByName("pzcfilter[210]")[0].checked = false; // BA
     document.getElementsByName("pzcfilter[210]")[0].disabled = false; // BA
    }
    
   }
   
   
   if (typeof filter_status.ra == 'undefined' || filter_status.ra == 0)
   {
    // initialen Wert lesen
    var var_alt = 0;
    var val_alt_elems = document.getElementsByName("zuweisung[zuweisung_reanimation_id]");
    for (var i = 0; i < val_alt_elems.length; i++)
    {
     if (val_alt_elems[i].checked === true)
     {
      var_alt = val_alt_elems[i];
      break;
     }
    }
    filter_status.ra = var_alt; // wir merken uns das element!
   }
   if (document.getElementById("zuweisung_reanimation_1"))
   {
    if (akt_checked === true)
    {
     document.getElementById("zuweisung_reanimation_1").checked = true;
     addClass(document.getElementById("zuweisung_reanimation_1").parentNode.parentNode, "highlight-change"); // label highlight
    }
    else
    {
     filter_status.ra.checked = true;
    }
   }
   
   /* beatmet triggern */
   if (document.getElementsByName("pzcfilter[210]").length > 0)
   {
    pzc_filter(document.getElementsByName("pzcfilter[210]")[0]);
   }
  break;
  
  /** Beatmet -> Intensivpflichtig deaktivieren */
  case 210:
   if (akt_checked === true)
   {
    if (parseInt(getData(document.getElementsByName("pzcfilter[230]")[0], "auswaehlbar")) > 0)
    {
     document.getElementsByName("pzcfilter[230]")[0].checked = false; // Int
     document.getElementsByName("pzcfilter[230]")[0].disabled = true; // Int
    }
   }
   else
   {
    if (parseInt(getData(document.getElementsByName("pzcfilter[230]")[0], "auswaehlbar")) > 0)
    {
     document.getElementsByName("pzcfilter[230]")[0].checked = false; // Int
     document.getElementsByName("pzcfilter[230]")[0].disabled = false; // Int
    }
   }
   
   
   if (typeof filter_status.ba == 'undefined' || filter_status.ba == 0)
   {
    // initialen Wert lesen
    var var_alt = 0;
    var val_alt_elems = document.getElementsByName("zuweisung[zuweisung_beatmet_id]");
    for (var i = 0; i < val_alt_elems.length; i++)
    {
     if (val_alt_elems[i].checked === true)
     {
      var_alt = val_alt_elems[i];
      break;
     }
    }
    filter_status.ba = var_alt; // wir merken uns das element!
   }
   if (document.getElementById("zuweisung_beatmet_1"))
   {
    if (akt_checked === true)
    {
     document.getElementById("zuweisung_beatmet_1").checked = true;
     addClass(document.getElementById("zuweisung_beatmet_1").parentNode.parentNode, "highlight-change"); // label highlight
    }
    else
    {
     filter_status.ba.checked = true;
    }
   }
  break;
  
  /* Schockraum */
  case 40:
   if (typeof filter_status.sr == 'undefined' || filter_status.sr == 0)
   {
    // initialen Wert lesen
    var var_alt = 0;
    var val_alt_elems = document.getElementsByName("zuweisung[zuweisung_schockraumres_id]");
    for (var i = 0; i < val_alt_elems.length; i++)
    {
     if (val_alt_elems[i].checked === true)
     {
      var_alt = val_alt_elems[i];
      break;
     }
    }
    filter_status.sr = var_alt; // wir merken uns das element!
   }
   if (document.getElementById("zuweisung_schockraumres_1"))
   {
    if (akt_checked === true)
    {
     document.getElementById("zuweisung_schockraumres_1").checked = true;
     addClass(document.getElementById("zuweisung_schockraumres_1").parentNode.parentNode, "highlight-change"); // label highlight
    }
    else
    {
     filter_status.sr.checked = true;
    }
   }
  break;
  
  /* Herzkatheter */
  case 50:
   if (typeof filter_status.hk == 'undefined' || filter_status.hk == 0)
   {
    // initialen Wert lesen
    var var_alt = 0;
    var val_alt_elems = document.getElementsByName("zuweisung[zuweisung_herzkatheterres_id]");
    for (var i = 0; i < val_alt_elems.length; i++)
    {
     if (val_alt_elems[i].checked === true)
     {
      var_alt = val_alt_elems[i];
      break;
     }
    }
    filter_status.hk = var_alt; // wir merken uns das element!
   }
   if (document.getElementById("zuweisung_herzkatheterres_1"))
   {
    if (akt_checked === true)
    {
     document.getElementById("zuweisung_herzkatheterres_1").checked = true;
     addClass(document.getElementById("zuweisung_herzkatheterres_1").parentNode.parentNode, "highlight-change"); // label highlight
    }
    else
    {
     filter_status.hk.checked = true;
    }
   }
  break;
  
  /* Arbeitsunfall */
  case 60:
   if (typeof filter_status.ab == 'undefined' || filter_status.ab == 0)
   {
    // initialen Wert lesen
    var var_alt = 0;
    var val_alt_elems = document.getElementsByName("zuweisung[zuweisung_arbeitsunfall_id]");
    for (var i = 0; i < val_alt_elems.length; i++)
    {
     if (val_alt_elems[i].checked === true)
     {
      var_alt = val_alt_elems[i];
      break;
     }
    }
    filter_status.ab = var_alt; // wir merken uns das element!
   }
   if (document.getElementById("zuweisung_arbeitsunfall_1"))
   {
    if (akt_checked === true)
    {
     document.getElementById("zuweisung_arbeitsunfall_1").checked = true;
     addClass(document.getElementById("zuweisung_arbeitsunfall_1").parentNode.parentNode, "highlight-change"); // label highlight
    }
    else
    {
     filter_status.ab.checked = true;
    }
   }
  break;
  
  /* Schwanger */
  case 70:
   if (typeof filter_status.schwanger == 'undefined' || filter_status.schwanger == 0)
   {
    // initialen Wert lesen
    var var_alt = 0;
    var val_alt_elems = document.getElementsByName("zuweisung[zuweisung_schwanger_id]");
    for (var i = 0; i < val_alt_elems.length; i++)
    {
     if (val_alt_elems[i].checked === true)
     {
      var_alt = val_alt_elems[i];
      break;
     }
    }
    filter_status.schwanger = var_alt; // wir merken uns das element!
   }
   if (document.getElementById("zuweisung_schwanger_1"))
   {
    if (akt_checked === true)
    {
     document.getElementById("zuweisung_schwanger_1").checked = true;
     addClass(document.getElementById("zuweisung_schwanger_1").parentNode.parentNode, "highlight-change"); // label highlight
    }
    else
    {
     filter_status.schwanger.checked = true;
    }
   }
  break;
  
  /* Freiheitsentzug */
  case 75:
  break;
  
  /* Ansteckungsfaehig */
  case 240:
   if (document.getElementById("zuweisung_infektioes"))
   {
    if (akt_checked === true)
    {
     addClass(document.getElementById("zuweisung_infektioes").parentNode, "highlight-change");
    }
    else
    {
     removeClass(document.getElementById("zuweisung_infektioes").parentNode, "highlight-change");
    }
   }
  break;
  
  default: 
   break;
 }
}

/**
 * Schaltet in der Zuweisungsmaske (Zuweisung ändern) den Modus von PZC-Disposition auf
 * FB-Disposition
 * 
 * Ruft nach dem Toggle den Status ab
 * 
 * @param string $modus "pzc" oder "fb"
 * @returns {undefined}
 */
function toggle_zuweisungsmodus($modus, $pzc_moeglich, $status_abfragen)
{
 // wenn auswahl ueber PZC nicht moeglich ist: Rueckfallen auf FB-Auswahl und den Rest ausblenden
 if ($pzc_moeglich === false)
 {
  $modus = "fb";
 }
 
 if ($modus === "pzc")
 {
  document.getElementById("change-zuweisung-auswahl-ueber-pzc").value = 1;
  
  addClass(document.getElementById("disp-via-pzc"), "via-aktiv");
  removeClass(document.getElementById("disp-via-fb"), "via-aktiv");
  addClass(document.getElementById("fbselect"), "hide");
  removeClass(document.getElementById("pzcselect"), "hide");
  removeClass(document.getElementById("pzc-filter-change-zuweisung"), "hide");
 }
 else if ($modus === "fb")
 {
  document.getElementById("change-zuweisung-auswahl-ueber-pzc").value = 0;
  
  removeClass(document.getElementById("disp-via-pzc"), "via-aktiv");
  addClass(document.getElementById("disp-via-fb"), "via-aktiv");
  addClass(document.getElementById("pzcselect"), "hide");
  addClass(document.getElementById("pzc-filter-change-zuweisung"), "hide");
  removeClass(document.getElementById("fbselect"), "hide"); 
 }
 
 if ($status_abfragen === true)
 {
  ajax_get_status_zeitleiste(document.getElementById("khs-status"));
 }
}

/**
 * Schliesst das "Zuweisung bearbeiten"-Formular
 * 
 * @returns boolean Maske schliessen
 */
function zuweisungsmaske_schliessen(target_id)
{
 var schliessen = confirm($GCS_LOCALE_ALARMIERUNG_ZUWEISUNG_BEARBEITEN_ABBRECHEN);
 
 if (schliessen === true)
 {
  schliesse_alle_infoboxen();
  automatische_aktualisierung_aktivieren();
  document.getElementById(target_id).style.display = "none";
  reload_page(0);
 }
 
 return schliessen;
}


/**
 * macht die Datenfehler-Prüfung und fragt den Status erneut ab
 * @returns {undefined}
 */
function submit_zuweisungsmaske(e)
{
 // Submit-Button deaktivieren
 var submit_button = document.getElementById("zuweisung-aendern-submit");
 var action_footer = document.getElementById("change-zuweisung-actions");
 var status_footer = document.getElementById("change-zuweisung-status");
 
 if (submit_button)
 {
  submit_button.disabled = true;
 }
 if (action_footer)
 {
  addClass(action_footer, "hide");
 }
 if (status_footer)
 {
  removeClass(status_footer, "hide");
 }
 
 var result = false;
 result = datenfehler_zuweisungsmaske();
 var resultFilter = true;
 if (result) {
  //resultFilter = ErweitertePZCFilterPruefung(e);
 }
 
 if (result && resultFilter) {
   ajax_get_status_zeitleiste(document.getElementById("khs-status"), true, e);
 } else {
  if (submit_button) {
   submit_button.disabled = false;
  }
  if (action_footer) {
   removeClass(action_footer, "hide");
  }
  if (status_footer) {
   addClass(status_footer, "hide");
  }
 }
 
 return false;
}

/**
 * Autocomplete für die Funktion pzc_select im Modus "autocomplete"
 * 
 * @returns {undefined}
 */
var pzc_liste_global = [];
function PZCAutocomplete()
{
 var pzc_input = document.getElementById("status_pzc");
 var pzc_label = document.getElementById("status_pzc-target");
 
 var pzc_liste_geoeffnet = false;
 var pzc_liste = document.createElement("ul");
 
 addClass(pzc_liste, "pzc-autocomplete");
 pzc_liste.setAttribute("id", "pzc_autocomplete_liste");
 
 /* Hilfsfunktionen */
 function zeichne_pzc(pzc, aktiv)
 {
  // hier drin die auswahl-Funktion definieren, die den Wert in den hidden-Input schreibt (und das AJAX danach abfeuert)
  
  var listEle = document.createElement("li");
  if (aktiv === true)
  {
   addClass(listEle, "pzc-aktiv");
  }
  var tb = document.createElement("span");
  var pzc_name_span = document.createElement("span");
  var hinweis_versorgung_span = document.createElement("span");
  var ta = document.createElement("a");
  ta.setAttribute("id", "pzc_element_"+pzc.pzc_code);
  ta.setAttribute("href", "#");
  
  addClass(tb, "pzc-autocomplete-item-code");
  tb.innerHTML = pzc.pzc_code.toString();
  
  var pzc_text = html_in_sonderzeichen(pzc.pzc_name);
  pzc_name_span.innerHTML = pzc_text;
  
  var pzc_versorgt = (parseInt(pzc.pzc_versorgt) || 0);
  var text_hinweis_keine_versorgung = "";
  if (pzc_versorgt === 0)
  {
   text_hinweis_keine_versorgung = " "+$GCS_LOCALE_PZC_OE_NICHT_VERSORGT;
   addClass(pzc_name_span, "oe-pzc-nicht-versorgt");
  }
  hinweis_versorgung_span.innerHTML = text_hinweis_keine_versorgung;
  
  var textEleTrenner = document.createTextNode(" - ");
  
  listEle.appendChild(ta);
  listEle.appendChild(tb);
  listEle.appendChild(textEleTrenner);
  listEle.appendChild(pzc_name_span);
  listEle.appendChild(hinweis_versorgung_span);
  
  pzc_liste.appendChild(listEle);
  pzc_input.parentNode.appendChild(pzc_liste);
  
  addData(listEle, "pzc_code", pzc.pzc_code);
  addData(listEle, "pzc_name", pzc.pzc_name);
  addData(listEle, "pzc_versorgt", pzc.pzc_versorgt);
  
  listEle.onclick = function(sender) {
   setze_aktiven_pzc(this);
  };
 }
 
 function zeichne_pzc_label(domnode)
 {
   var t_label = "";
   if (domnode)
   {
    t_label = domnode.getAttribute("data-pzc_name");
   }
   
   pzc_label.setAttribute("title", t_label);
   if (t_label.length > 30)
   {
    t_label = t_label.substr(0, 30)+"...";
   }
   pzc_label.innerHTML = t_label;
 }
 
 function pzc_liste_leeren()
 {
  pzc_liste.innerHTML = "";
 }
 
 function pzc_liste_schliessen()
 {
  pzc_liste_leeren();
  addClass(pzc_liste, "hide");
  pzc_liste_geoeffnet = false;
 }
 
 function pzc_uebernehmen()
 {
  var aktiver_pzc = get_aktiven_pzc();
  if (aktiver_pzc)
  {
   var pzc_versorgt = (parseInt(aktiver_pzc.getAttribute("data-pzc_versorgt")) || 0);
   if (pzc_versorgt === 1 /* && pzc_gueltig === true*/ )
   {
    pzc_input.value = aktiver_pzc.getAttribute("data-pzc_code");
    zeichne_pzc_label(aktiver_pzc);

    pzc_liste_schliessen();
    ajax_get_status_zeitleiste(document.getElementById("khs-status"));
   }
   else
   {
    alert($GCS_LOCALE_PZC_OE_NICHT_VERSORGT);
    pzc_liste_schliessen();
   }
  }
 }
 
 function reset_aktiven_pzc()
 {
  var children = pzc_liste.childNodes;
  var anzahl_kinder = children.length;
  if (anzahl_kinder > 0)
  {
   for (var i = 0; i < anzahl_kinder; i++)
   {
    if (hasClass(pzc_liste.childNodes[i], "pzc-aktiv"))
    {
     removeClass(pzc_liste.childNodes[i], "pzc-aktiv");
    }
   }
  }
 }
 
 function setze_aktiven_pzc(aktiver_pzc)
 {
  reset_aktiven_pzc();
  addClass(aktiver_pzc, "pzc-aktiv");
  pzc_uebernehmen();
 }
 
 function get_aktiven_pzc()
 {
  var element_aktiv = [];
  
  var children = pzc_liste.childNodes;
  var anzahl_kinder = children.length;
  if (anzahl_kinder > 0)
  {
   for (var i = 0; i < anzahl_kinder; i++)
   {
    if (hasClass(pzc_liste.childNodes[i], "pzc-aktiv"))
    {
     element_aktiv = pzc_liste.childNodes[i];
     break;
    }
   }
   /* element_aktiv = pzc_liste.childNodes[0]; */ // wir liefern immer das erste Element
  }
  
  return element_aktiv;
 }
 
 function matches(input)
 {
  pzc_liste_leeren();
  removeClass(pzc_liste, "hide");
  var isfirst = true;

  for(var i=0; i<pzc_liste_global.length; i++)
  {
   var tcode = pzc_liste_global[i].pzc_code.toString().toLowerCase();
   /* || html_in_sonderzeichen(obj[i].pzc_name.toString().toLowerCase()).search(input) !== -1 */ 
   if( (tcode.search(input) !== -1 && input.length > 0 && (tcode.indexOf(input) === 0) ) || input.length === 0)
   {
    zeichne_pzc(pzc_liste_global[i], isfirst);
    isfirst = false;
    pzc_liste_geoeffnet = true;
   }
  }
  
  if (isfirst === true)
  {
   pzc_liste_schliessen();
  }
 }
 
 this.init = function()
 {
  if (typeof pzc_input === 'undefined' || pzc_input === null)
  {
   return false;
  }
  
  pzc_input.onkeyup = function(event)
  {
   event = event || window.event;
   
   // verschiedene keys durchwechseln
   switch (event.keyCode)
   {
    case 13: /* Enter */
     pzc_uebernehmen();
     break;
     
    case 38: /* Arrow up */
     pzc_wechseln("hoch");
     return false;
     break;
     
    case 27: /* Escape */
     pzc_liste_schliessen();
     return false;
     break;
    
    case 40: /* Arrow down */
     pzc_wechseln("runter");
     return false;
     break;
     
    /* Ziffern 0 - 9 */
    case 48:
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
    case 45: /* INS */
    case 46: /* DEL */
    case 8: /* BS */
     matches(pzc_input.value);
     break;
     
    default:
     matches(pzc_input.value);
     break;
   }
   
  };
  
  pzc_input.onblur = function()
  {
   ajax_get_status_zeitleiste(document.getElementById("khs-status"));
  };
 };
 
 /**
  * 
  * @param string richtung hoch oder runter
  * @returns {undefined}
  */
 pzc_wechseln = function(richtung)
 {
  if (pzc_liste_geoeffnet === false)
  {
   matches(pzc_input.value);
  }
  
  var active = get_aktiven_pzc();  
  var active_neu = active;
  
  var first_elem = 0;
  var last_elem = 0;
  if (pzc_liste.childNodes.length > 0)
  {
   first_elem = pzc_liste.childNodes[0];
   last_elem = pzc_liste.childNodes[(pzc_liste.childNodes.length-1)];
  }
  
  removeClass(active, "pzc-aktiv");
  
  if (richtung === "hoch")
  {
   /* console.log(active.tagName); */
   if (active.previousSibling)
   {
    active_neu = active.previousSibling;
   }
   else
   {
    active_neu = last_elem;
   }
   
  }
  else if (richtung === "runter")
  {
   if (active.nextSibling)
   {
    active_neu = active.nextSibling;
   }
   else
   {
    active_neu = first_elem;
   }
  }
  
  /* a fokussieren (fuer Scroll-Effekt) */
  if (active_neu)
  {
   addClass(active_neu, "pzc-aktiv");
   active_neu.focus();
   var ta = active_neu.getElementsByTagName("a");
   if (ta[0])
   {
    ta[0].focus();  /* hiermit bringen wir ihn zum scrollen */
    pzc_input.focus();
    setzeCursorPosition(pzc_input, pzc_input.value.length);
   }
   
   zeichne_pzc_label(active_neu);
  }  
 };
 
 validiere_pzc = function(akt_pzc_code)
 {
  var gueltig = false;
  
  for(var i=0; i<pzc_liste_global.length; i++)
  {
   var tcode = pzc_liste_global[i].pzc_code.toString().toLowerCase();
   if (tcode === akt_pzc_code.toString())
   {
    gueltig = true;
    break;
   }
  }
  
  return gueltig;
 };
};


/**
 * Durchsucht die PZC-Suchbegriffe und Synonyme
 * 
 * @returns {undefined}
 */
var PZC_BD_AUSWAEHLBAR = {
 "1": true,
 "2": true,
 "3": true,
 "4": true
};

var pzc_synonym_liste_global = [];
function PZCSuche()
{
 this.ajax_request;
 this.pzc_synonym_input;
 this.pzc_synonym_target_input; /* hidden-Input, in welchem die ID abgelegt wird */
 this.pzc_synonym_gui_target;
 this.pzc_synonym_gui_label_target;
 this.synonym_block_refresh = true;
 this.pzc_synonym_liste = false;
 
 var selbst = this;
 
 var url = "remote.php?view=pzc_synonym_suche&modus=1&si=" + escape($IVENA_SI) + "&rnd="+String(Math.random());
 var postData = {};
 
 /* Hilfsfunktion zum Verzögern des AJAX */
 var ajax_delay = function()
 {
   var timer = 0;
   return function(callback, ms){
     clearTimeout (timer);
     timer = setTimeout(callback, ms);
   };
 }();
 
 
 
 var callbacks = {
		success: function( $pm_response, $pm_data, $po_options ) {
   automatische_aktualisierung_unterbrechen();
			if( $pm_response.status === 1 ) {
    pzc_synonym_liste_global = $pm_response.data;
    pzc_synonym_liste_leeren();
    removeClass(selbst.pzc_synonym_liste, "hide");
    selbst.pzc_synonym_liste.innerHTML = $pm_response.data;

    var items = selbst.pzc_synonym_liste.getElementsByTagName("li");
    if (items.length > 0) {
     for (var i = 0; i < items.length; ++i) {
       items[i].onclick = function(sender) {
        selbst.setze_aktiven_pzc(this);
       };
     }
    }
    BoxAusrichten(jQuery("#pzc-eingabe-synonym-input"), jQuery(selbst.pzc_synonym_liste), "right top", "right bottom");
			}
		},
		error: function( $pm_response, $pm_data, $po_options ) {
   return;
		},
		requestDidFinished: function( $pm_response, $pm_data, $po_options ) {
   hide_loading_animation();
   return;
		}
	};
 
 pzc_synonym_liste_leeren = function ()
 {
  if (selbst.pzc_synonym_liste)
  {
   selbst.pzc_synonym_liste.innerHTML = "";
  }
 };
 
 this.pzc_liste_schliessen = function ()
 {
  pzc_synonym_liste_leeren();
  addClass(selbst.pzc_synonym_liste, "hide");
  if (selbst.synonym_block_refresh === true)
  {
   automatische_aktualisierung_aktivieren();
  }
 };
 
 this.reset_aktiven_pzc = function()
 {
  var children = selbst.pzc_synonym_liste.childNodes;
  var anzahl_kinder = children.length;
  if (anzahl_kinder > 0)
  {
   for (var i = 0; i < anzahl_kinder; i++)
   {
    if (hasClass(children[i], "pzc-aktiv"))
    {
     removeClass(children[i], "pzc-aktiv");
    }
   }
  }
 };
 
 /**
  * 
  * @param {type} aktiver_pzc
  * @returns {undefined}
  */
 this.setze_aktiven_pzc = function(aktiver_pzc)
 {
  selbst.reset_aktiven_pzc();
  addClass(aktiver_pzc, "pzc-aktiv");
  selbst.pzc_uebernehmen();
 };
 
 /**
  * 
  * @returns {undefined}
  */
 this.pzc_uebernehmen = function()
 {
  var aktiver_pzc = selbst.get_aktiven_pzc();
  
  if (aktiver_pzc !== undefined && aktiver_pzc.tagName !== undefined)
  {
   /* aus Kompatibilitätsgruenden auf getAttribute anstelle von getData umgestellt */
   selbst.pzc_synonym_target_input.value = aktiver_pzc.getAttribute("data-pzc_synonym_id"); // getData(aktiver_pzc, "pzc_synonym_id");
   selbst.pzc_synonym_input.value = html_in_sonderzeichen(aktiver_pzc.getAttribute("data-pzc_name"));
   selbst.pzc_synonym_gui_target.value = aktiver_pzc.getAttribute("data-pzc_code");
   
   if (selbst.pzc_synonym_gui_label_target)
   {
    selbst.pzc_synonym_gui_label_target.innerHTML = html_in_sonderzeichen(aktiver_pzc.getAttribute("data-pzc_name"));
   }
   
   /* auswaehlbar-Werte befuellen */
   PZC_BD_AUSWAEHLBAR = {
    "1": Boolean(parseInt(aktiver_pzc.getAttribute("data-bd-auswaehlbar-1"))),
    "2": Boolean(parseInt(aktiver_pzc.getAttribute("data-bd-auswaehlbar-2"))),
    "3": Boolean(parseInt(aktiver_pzc.getAttribute("data-bd-auswaehlbar-3"))),
    "4": Boolean(parseInt(aktiver_pzc.getAttribute("data-bd-auswaehlbar-4")))
   };
   
   
   
   selbst.pzc_liste_schliessen();
   selbst.pzc_synonym_gui_target.focus();
   setzeCursorPosition(selbst.pzc_synonym_gui_target, 3);
  }
 };
 
 /**
  * 
  * @returns {Array|pzc_synonym_liste.childNodes|document@call;createElement.childNodes}
  */
 this.get_aktiven_pzc = function()
 {
  var element_aktiv = [];
  
  var children = selbst.pzc_synonym_liste.childNodes;
  var anzahl_kinder = children.length;
  if (anzahl_kinder > 0)
  {
   for (var i = 0; i < anzahl_kinder; i++)
   {
    if (hasClass(children[i], "pzc-aktiv"))
    {
     element_aktiv = children[i];
     break;
    }
   }
  }
  
  return element_aktiv;
 };
 
 /**
  * 
  * @param string richtung hoch oder runter
  * @returns {undefined}
  */
 this.pzc_wechseln = function(richtung)
 {
  var active = selbst.get_aktiven_pzc();  
  var active_neu = active;
  
  var first_elem = 0;
  var last_elem = 0;
  
  liste = selbst.pzc_synonym_liste;
  
  if (liste.childNodes.length > 0)
  {
   first_elem = liste.childNodes[0];
   last_elem = liste.childNodes[(liste.childNodes.length-1)];
  }
  
  removeClass(active, "pzc-aktiv");
  
  if (richtung === "hoch")
  {
   if (active.previousSibling)
   {
    active_neu = active.previousSibling;
   }
   else
   {
    active_neu = last_elem;
   }
  }
  else if (richtung === "runter")
  {
   if (active.nextSibling)
   {
    active_neu = active.nextSibling;
   }
   else
   {
    active_neu = first_elem;
   }
  }
  
  /* a fokussieren (fuer Scroll-Effekt) */
  if (active_neu)
  {
   addClass(active_neu, "pzc-aktiv");
   active_neu.focus();
   var ta = active_neu.getElementsByTagName("a");
   if (ta[0])
   {
    ta[0].focus();  /* hiermit bringen wir ihn zum scrollen */
    selbst.pzc_synonym_input.focus();
    setzeCursorPosition(selbst.pzc_synonym_input, selbst.pzc_synonym_input.value.length);
   }
  }  
 };
 
 
 this.init = function(input_element, target_element, gui_target_element, gui_label_target, block_refresh)
 {
  this.pzc_synonym_liste = document.createElement("ul");
  addClass(this.pzc_synonym_liste, "hide");
  addClass(this.pzc_synonym_liste, "pzc-synonyme");
  
  this.pzc_synonym_input = document.getElementById(input_element);
  if (typeof this.pzc_synonym_input === 'undefined' || this.pzc_synonym_input === null)
  {
   return false;
  }
  this.pzc_synonym_input.PZCSuche = this; /* this = that */
  
  this.pzc_synonym_target_input = document.getElementById(target_element);
  if (typeof this.pzc_synonym_target_input === 'undefined' || this.pzc_synonym_target_input === null)
  {
   return false;
  }
  
  this.pzc_synonym_gui_target = document.getElementById(gui_target_element);
  if (typeof this.pzc_synonym_gui_target === 'undefined' || this.pzc_synonym_gui_target === null)
  {
   return false;
  }
  
  /* optionales Label */
  if ((typeof gui_label_target !== 'undefined' && gui_label_target !== null))
  {
   if (gui_label_target.length > 0)
   {
    this.pzc_synonym_gui_label_target = document.getElementById(gui_label_target);
   }
  }
  
  if ((typeof block_refresh !== 'undefined' && block_refresh !== null))
  {
   this.synonym_block_refresh = block_refresh;
  }
  
  this.pzc_synonym_input.parentNode.appendChild(this.pzc_synonym_liste);
  
  /* Sonderfall enter bei keypress abfangen, sonst wird das onsubmit des PZC-Formulars ausgeloest */
  this.pzc_synonym_input.onkeypress = function(event)
  {
   event = event || window.event;
   switch (event.keyCode)
   {
    case 9: /* Tabulator analog Arrow down */
     if (hasClass(this.PZCSuche.pzc_synonym_liste, "hide"))
     {
      return true;
     }
     selbst.pzc_wechseln("runter");
     return false;
     break;
     
    case 13: /* Enter */
     selbst.pzc_uebernehmen();
     return false;
     break;
   }
  };
  
  this.pzc_synonym_input.onkeyup = function(event)
  {
   event = event || window.event;
   
   if (this.value.length < 1)
   {
    selbst.pzc_liste_schliessen();
    return;
   }

   // verschiedene keys durchwechseln
   switch (event.keyCode)
   {
    case 13: /* Enter */
     selbst.pzc_uebernehmen();
     break;
     
    case 38: /* Arrow up */
     selbst.pzc_wechseln("hoch");
     return false;
     break;
     
    case 27: /* Escape */
     /* wenn offen: schliessen; ansonsten: leeren */
     selbst.pzc_synonym_input.value = "";
     selbst.pzc_liste_schliessen();
     return false;
     break;
    
    case 9: /* Tabulator analog Arrow down */
     return false;
     break;
    
    case 40: /* Arrow down */
     selbst.pzc_wechseln("runter");
     return false;
     break;
     
    /* Ziffern 0 - 9 */
    case 48:
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
    case 45: /* INS */
    case 46: /* DEL */
    case 8: /* BS */
     if (selbst.ajax_request) { selbst.ajax_request.abort(); }
     
     var elem = this;
     
     ajax_delay(function(){
      show_loading_animation();
      postData.suchbegriff = elem.value;
      selbst.ajax_request = AJAX.post(url, postData, callbacks, "json");
     }, 500 );
     break;
     
    default:
     if (selbst.ajax_request) { selbst.ajax_request.abort(); }
     
     var elem = this;
     
     ajax_delay(function(){
      show_loading_animation();
      postData.suchbegriff = elem.value;
      selbst.ajax_request = AJAX.post(url, postData, callbacks, "json");
     }, 500 );
     
     break;
   }
  };
  
  this.pzc_synonym_liste.onclick = function(event)
  {
   selbst.pzc_uebernehmen();
  };
  
 };
}


/**
 * Sonderbehandlung Sekundaeranlass
 */
var SKIP_DATENFEHLER_ANLASS = false;
var SKIP_DATENFEHLER_SEKANLASS = false;
var change_sekundaeranlass = function(sender, akt_anlass_elemExtern, sek_anlass_elemExtern) {
 
 var akt_anlass_elem = undefined;
 if (document.getElementById("zuweisung_anlass")) {
  akt_anlass_elem = document.getElementById("zuweisung_anlass");
 } else if (akt_anlass_elemExtern) {
  akt_anlass_elem = akt_anlass_elemExtern;
 }
 var sek_anlass_elem = undefined;
 if (document.getElementById("zuweisung_sekundaeranlass_id")) {
  sek_anlass_elem = document.getElementById("zuweisung_sekundaeranlass_id");
 } else if (sek_anlass_elemExtern) {
  sek_anlass_elem = sek_anlass_elemExtern;
 }
 
 if (akt_anlass_elem !== undefined && akt_anlass_elem.length > 0 && sek_anlass_elem !== undefined && sek_anlass_elem.length > 0)
 {
  var main_elem = akt_anlass_elem;
  var sek_elem = sek_anlass_elem;
  
  if (sender === sek_anlass_elem) {
   main_elem = sek_anlass_elem;
   sek_elem = akt_anlass_elem;
   SKIP_DATENFEHLER_ANLASS = true;
   SKIP_DATENFEHLER_SEKANLASS = false;
  } else if (sender === akt_anlass_elem) {
   SKIP_DATENFEHLER_ANLASS = false;
   SKIP_DATENFEHLER_SEKANLASS = true;
  } else {
   SKIP_DATENFEHLER_ANLASS = false;
   SKIP_DATENFEHLER_SEKANLASS = false;
  }
  
   var akt_val = main_elem.value;
   var akt_val_val = parseInt(akt_val);
   if (akt_val.length > 0 && akt_val_val !== 0) {
    // Sekundaeranlass ausblenden und zuruecksetzen
    sek_elem.value = '';
    sek_elem.disabled = true;
    jQuery(sek_elem).parents("tr").children(".required").removeClass("required");
   } else {
    // Sekundaeranlass einblenden    
    sek_elem.disabled = false;
    jQuery(sek_elem).parents("tr").children("td").addClass("required");
   }
 }
 else if (akt_anlass_elem !== undefined)
 {
  SKIP_DATENFEHLER_ANLASS = false;
  SKIP_DATENFEHLER_SEKANLASS = true;
 }
 else if (sek_anlass_elem !== undefined)
 {
  SKIP_DATENFEHLER_ANLASS = true;
  SKIP_DATENFEHLER_SEKANLASS = false;
 }
};

var SelektorenAnlassPrimaerAPI = "select[name='APIZuweisung[feld][zuweisung_anlass_id]']";
var SelektorenAnlassSekundaerAPI = "select[name='APIZuweisung[feld][zuweisung_sekundaeranlass_id]']";
var SelektorAnlassAPIKombiniert = SelektorenAnlassPrimaerAPI + ", " + SelektorenAnlassSekundaerAPI;
jQuery(document).on("change", SelektorAnlassAPIKombiniert, function(e) {
 change_sekundaeranlass(e.target, jQuery(SelektorenAnlassPrimaerAPI).get(0), jQuery(SelektorenAnlassSekundaerAPI).get(0));
});

/**
 * zusaetzliche FBs
 */
jQuery(document).on("click", ".zeitstrahl-fb-kumuliert", function(e) {
 jQuery(e.target).parents("tbody.oe-zeile").children("tr.zeitstrahl.zeitleiste-oe").toggleClass("hide");
 return false;
});

var ZuweisungsLinkSelektor = "a.zuweisung";
var APIOESelektor = "tr.api-oe";
var ZuweisungsLinkSelektorAPIOE = APIOESelektor + " " + ZuweisungsLinkSelektor;

var ZuweisungsBoxSchliessenSelektor = ".alarmierungsbox .close";
jQuery(document).on("click", ZuweisungsBoxSchliessenSelektor, function() { // schliessen von Zuweisungsboxen abbilden (sollten geleert werden!)
 schliesse_alle_infoboxen();
});

var SelektorOEFormularDaten = "form.OE"; // hier stehen die erforderlichen Formularfelder
/**
 * liefert: Instanz, OEId, BDId
 * 
 * @param {type} e
 * @returns {Array}
 */
var AktuelleOEZeileFormularDaten = function(e) {
 var FormData = jQuery(e).parents("tr").find(SelektorOEFormularDaten);
 return FormData;
};

// Kontaktbox schliessen
jQuery(document).on("click", KontaktBoxSchliessenSelektor, function(e) {
 jQuery(e.target).parents(KontaktBoxSelektor).hide();
});

var SelektorMFIdKomponenten = ".MasterfallIdContainer a";
var SelektorMFIdInputText = "[name='MasterfallId[Gesamt]']";
jQuery(document).on("click", SelektorMFIdKomponenten, function (e) {
 var MasterfallIdInput = jQuery(this).children("input[name='MasterfallId[Gesamt]']");
 
 var TargetIstSelektorMFIdInputText = (jQuery(e.target).is(SelektorMFIdInputText));
 if (TargetIstSelektorMFIdInputText) {
  return false; // im input text soll nicht eingegriffen werden
 }
 
 var textArea = document.createElement("textarea");
 textArea.value = MasterfallIdInput.val();

 // Avoid scrolling to bottom
 textArea.style.top = "0";
 textArea.style.left = "0";
 textArea.style.position = "fixed";

 document.body.appendChild(textArea);
 textArea.focus();
 textArea.select();

 try {
   var successful = document.execCommand('copy');
   //var msg = successful ? 'successful' : 'unsuccessful';
   //console.log('Fallback: Copying text command was ' + msg);
 } catch (err) {
   //console.error('Fehler: ', err);
 }
 
 document.body.removeChild(textArea);
 if (successful) {
  jQuery(this).toggleClass("ErfolgreichKopiert", !jQuery(this).hasClass("ErfolgreichKopiert"), 1000, "swing", function() {
   jQuery(this).toggleClass("ErfolgreichKopiert", false, 1000, "swing");
  });
 }
 
 return false;
});

jQuery(function() {
 if (jQuery("#ZielOENachricht").length > 0) {
  alert(jQuery("#ZielOENachricht").text());
 }
});