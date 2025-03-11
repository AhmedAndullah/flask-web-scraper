/**
 * Alternative Anzeige zu den Standard-title-Tags.
 * Ist die globale Variable $GCB_USE_ALTERNATIVE_TITLES gesetzt, so wird die
 * Initialisierung der alternativen Titles automatisch an das window.load-Ereignis
 * angebunden.
 * 
 * Vorgabe: $GCB_USE_ALTERNATIVE_TITLES : boolean
 * Elemente: $GCS_ALTERNATIVE_TITLES_OBJECTS : string
 */

var $span_title_object = null;
var $gca_alternative_titles_objects = new Array();
if( !$GCS_ALTERNATIVE_TITLES_OBJECTS )
 {
	var $GCS_ALTERNATIVE_TITLES_OBJECTS = "p,a,td,th,img,li,input,span,div";
 }


function create_span_title_on_element( $element )
 {
	var obj = new MainisJS( $element );
	var $tmp_title = $element['title'];
	var $tmp_data_title = obj.data("data-ivena-title");
	
	
	if( $tmp_title && $tmp_title !== "" && $tmp_title !== "null" )
	 {
		// Das spezielle Data-title-Attribut wird überprüft. Sollte es existieren
		// wird das Attribut nicht überschrieben, sollte es nicht exisiteren,
		// wird das Attribut erweitert
		if( !$tmp_data_title || $tmp_data_title === "" || $tmp_data_title === "null" || "undefined" === typeof($tmp_data_title) )
		 {
			// Spezielles Data-Attribut setzen
			obj.data("data-ivena-title", $tmp_title);
			
			addIVENAListener("mouseover", $element, function($event)
			 {
				var $target = $event.target || $event.srcElement;
				var $data_title = "";
				// Es muss durch das Bubbling geprüft werden ob das aktuelle Zielelement
				// auch das ausgelöste Element ist. Somit wird verhindert das
				// ggf. das Title-Tag von Elternelementen das aktuelle überschreiben.
				$data_title = (new MainisJS($target)).data("data-ivena-title");

				if( $data_title && "" !== $data_title && "null" !== $data_title )
				 {
					$span_title_object.innerHTML = $data_title;
					$span_title_object.style.display = 'block';
				 }
			 });

			addIVENAListener("mouseout", $element, function()
			 {
				$span_title_object.innerHTML = '';
				$span_title_object.style.display = 'none';
			 });
		 }
		$element['title'] = '';
	 }
 }
 
 
 
if( "undefined" !== typeof($GCB_USE_ALTERNATIVE_TITLES) && true === $GCB_USE_ALTERNATIVE_TITLES )
 {
	addIVENAListener("load", window, function() {
		$span_title_object = document.getElementById("abs-title-object");

		var $tmp_nodes = null;
		var $elements = $GCS_ALTERNATIVE_TITLES_OBJECTS.split(",");
		for( $i=0; $i<$elements.length; $i++ )
		 {
			$tmp_nodes = document.getElementsByTagName( $elements[$i] );	
			$gca_alternative_titles_objects.push($tmp_nodes);
			$tmp_nodes = null;
		 }

		for( var $j=0; $j < $gca_alternative_titles_objects.length; $j++ )
		 {
			for( var $i=0; $i < $gca_alternative_titles_objects[$j].length; $i++ )
			 {
				create_span_title_on_element( $gca_alternative_titles_objects[$j][$i] );
			 }
		 }
		 
		addIVENAListener("mousemove", document, function(event) {
			event = event || window.event;

			var $mouse_position = get_mouse_position(event);
			
			var w = window,
				d = document,
				e = d.documentElement,
				g = d.getElementsByTagName('body')[0],
				x = w.innerWidth || e.clientWidth || g.clientWidth,
				y = w.innerHeight|| e.clientHeight|| g.clientHeight;
			
			$span_title_object.style.top = ($mouse_position.top+10) + 'px';
			
			// Wenn das Element über der Hälfte des Browser-Viewports ist, dann soll
			// das Fenster nicht nach rechts geöffnet werden, sondern der Kasten sich
			// linksseitig orientieren, damit er nicht aus dem Darstellungsbereich
			// läuft.
			if( $mouse_position.left > (x/2) )
			 {
				$span_title_object.style.left = 'auto';
				$span_title_object.style.right = (x-$mouse_position.left+10) + 'px';
			 }
			else
			 {
				$span_title_object.style.left = ($mouse_position.left+30) + 'px';
				$span_title_object.style.right = 'auto';
			 }
		});
	});
 }