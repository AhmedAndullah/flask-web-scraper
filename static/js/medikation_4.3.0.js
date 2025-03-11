var MedikationInputAJAX = function(Form, source_element) {
	/**
	 * view-Paremeter ersetzen (nicht so schön!)
	 */
	var data = jQuery(Form).serializeArray(); // muss jQuery-Objekt sein!
	var ViewGesetzt = false;
	data.forEach(function (item)
	{
		if (item.name === 'view')
		{
				item.value = "ZuweisungMedikationInput";
				ViewGesetzt = true;
		}
	});
	if (!ViewGesetzt) // nicht gefunden: hinzufuegen
	{
		data.push( {name: "view", "value": "ZuweisungMedikationInput"} );
	}
		
		var TargetElement = jQuery(Form).find(MEDIKATIONCONTAINERCLASS);
	
  ACTIVE_AJAX_REQUEST = jQuery.ajax({
   url: "remote.php",
   beforeSend: function() { show_loading_animation(); },
   data: jQuery.param(data),
   method: "POST",
			cache: false
  })
  .done(function(data, textStatus, jqXHR) { TargetElement.append(data); /* DISP_SUCHE_DONE(data, textStatus, jqXHR, source_element); */ } )
  .fail(function(jqXHR, textStatus, errorThrown) { DISP_SUCHE_FEHLER(jqXHR, textStatus, errorThrown, source_element); })
  .always( function() { hide_loading_animation(); } );
};

var BTNNEU = ".zuweisungmedikation-neu";
var MEDIKATIONCONTAINERCLASS = ".ZuweisungMedikationContainer";

jQuery(document).ready(function() {
	jQuery(document).on("click", BTNNEU, function(e) {
		
		
		var ParentForm = jQuery(e.target).parents("form")[0];
		// Zaehler inkrementieren...
		var ZaehlerElement = jQuery(ParentForm).find("[name='zuweisung-medikation-zaehler']");
		var ZaehlerWert = parseInt(ZaehlerElement.val());
		ZaehlerWert++;
		ZaehlerElement.val(ZaehlerWert);
		
		// Feuer frei...
		MedikationInputAJAX(ParentForm);
		
		return false;
	});
});