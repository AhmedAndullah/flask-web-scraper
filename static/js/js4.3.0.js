/** @var {object} Cache für alle AJAX-Requests */
var $AJAXCALLS = {
	demo: {
		jqXHR: null,
		timestamp: -1
	}
};

/**
 * jQuery(ContainerElement).position({
     my: mymy,
     at: myat,
     of: AnkerElement,
     collision: mycollision
    });
 * @param {type} AnkerElement
 * @param {type} ContainerElement
 * @param {string} my
 * @param {string} at
 * @param collision
 * @return {undefined}
 */
function BoxAusrichten(AnkerElement, ContainerElement, myValue, atValue, collisionValue) {
 var mymy = "right top";
 if (myValue !== undefined) {
  mymy = myValue;
 }
 var myat = "left bottom";
 if (atValue !== undefined) {
  myat = atValue;
 }
 var mycollision = "flipfit";
 if (collisionValue !== undefined) {
  mycollision = collisionValue;
 }
 
 if (AnkerElement.length > 0 && ContainerElement.length > 0) {
  jQuery(ContainerElement).position({
     my: mymy,
     at: myat,
     of: AnkerElement,
     collision: mycollision
    });
  }
}

/**
 * 
 * Browser Detection Global Vars
 */
var $is_ie = 0;
var $global_mouse_event_down = null;
var AJAXRequests = {};

/**
 * document.getElementsByClassName()
 * For all IEs that lacks of support for this function.
 * 
 * @see	http://www.webdeveloper.com/forum/showthread.php?198227-How-to-getElementByClass&p=962653#post962653
 */
if (!document.getElementsByClassName)
 {
	document.getElementsByClassName = function (cn)
	 {
		var rx = new RegExp("(?:^|\\s)" + cn+ "(?:$|\\s)");
		var allT = document.getElementsByTagName("*"), allCN = [],ac="", i = 0, a;
		while ((a = allT[i=i+1]))
		 {
			ac=a.className;
			if ( ac && ac.indexOf(cn) !==-1)
			 {
				if(ac===cn)
				 {
					 allCN[allCN.length] = a;
					 continue;
				 }
				rx.test(ac) ? (allCN[allCN.length] = a) : 0;
			 }
		 }
		return allCN;
	 };
 }
 
isArray = Array.isArray || function(arr)
{
  return Object.prototype.toString.call(arr) === '[object Array]';
};

// Cross-browser implementation of element.addEventListener()
function addIVENAListener(evnt, $element, func) {
    if ($element.addEventListener)								// W3C DOM
	 {
        $element.addEventListener(evnt, func, false);
	 }
    else if ($element.attachEvent)								// IE DOM
	 {
         var r = $element.attachEvent("on"+evnt, func);
         return r;
     }
    else
	 {
		 /* console.error("addEventListener() ist nicht vorhanden!", evnt, $element, func); */
	 }
}

function getEventTarget( e )
{
	e = e || window.event;
	
	var $target = null;
	// Wenn es ein Custom-Event ist, kann es sein, dass das target im 
	// detail-Container eingeschrieben ist. Ist dort eines angegeben, dann wird 
	// explizit dieses Element als Ziel genutzt, ansonsten die automatisch dem 
	// Event übergebenen.
	if( e.detail && "object" === typeof(e.detail.target) )
	{
		$target = e.detail.target;
	}
	else
	{
		$target = e.target || e.srcElement;
	}
	return $target;
}

if( "function" !== typeof(Array.indexOf) )
 {
	Array.prototype.indexOf = function(obj, start)
	 {
		for (var i = (start || 0), j = this.length; i < j; i++)
		 {
			if (this[i] === obj)
			 {
				 return i;
			 }
		 }
		return -1;
	 }
 }

function strpos($ps_str, $ps_needle, $pi_offset) {
  var $index = ($ps_str + "").indexOf($ps_needle, ($pi_offset || 0));
  return ($index === -1) ? false : $index;
}

/**
 * Erstellt eine eindeutige ID (vgl. PHP-Function uniqid())
 * 
 * @version 1.0
 * 
 * @param {String} $ps_prefix
 * @returns {String}
 */
function create_uniqid( $ps_prefix )
{
	var $prefix = $ps_prefix;
	if( "string" !== typeof($prefix) ) { $prefix = ""; }
	return $prefix + (new Date().getTime()).toString(16) + "_" + Math.random();
}

/**
 * 
 * @param {type} $element
 * @param {type} $classname
 * @returns {undefined}
 */
function addClass( $element, $classname )
 {
	var $elemente = new Array();
	if( "string" === typeof($element) )
	{
		if( "." !== $element.substr(0, 1) )
		{
			$elemente.push(document.getElementById($element));
		}
		else
		{
			var $classelemente = document.getElementsByClassName($element.substr(1));
			for( var $i=0; $i<$classelemente.length; $i++ )
			{
				$elemente.push( $classelemente[$i] );
			}
		}
	}
	else
	{
		$elemente.push($element);
	}

	for( $i=0; $i<$elemente.length; $i++ )
	{
		if( $elemente[$i] && !hasClass( $elemente[$i], $classname ) )
		{
			if($elemente[$i].classList)
			{
				$elemente[$i].classList.add($classname);
			}
			else
			{
				$elemente[$i].className += " " + $classname;
			}
		}
	}
 }

/**
 * 
 * @param {type} $element
 * @param {type} $classname
 * @returns {Boolean}
 */
function hasClass( $element, $classname )
 {
	if( "string" === typeof($element) ) { $element = document.getElementById($element); }
	
	var $classes = "";
	var $ergebnis = false;
	if( $element && $element.classList )
	{
		$ergebnis = $element.classList.contains($classname);
	}
	else if( $element )
	{
		$classes = $element.className;
		$ergebnis = ( (" " + $classes + " ").replace(/[\t\r\n\f]/g, " ").indexOf(" "+$classname+" ") > -1 );
	}
	return $ergebnis;
 }
 
function removeClass( $element, $classname )
{
	var $elemente = new Array();
	if( "string" === typeof($element) )
	{
		if( "." !== $element.substr(0, 1) )
		{
			$elemente.push(document.getElementById($element));
		}
		else
		{
			var $classelemente = document.getElementsByClassName($element.substr(1));
			for( var $i=0; $i<$classelemente.length; $i++ )
			{
				$elemente.push( $classelemente[$i] );
			}
		}
	}
	else
	{
		$elemente.push($element);
	}

	for( $i=0; $i<$elemente.length; $i++ )
	{
		if( hasClass( $elemente[$i], $classname ) )
		{
			if($elemente[$i].classList)
			{
				$elemente[$i].classList.remove($classname);
			}
			else
			{
				var $classes = " " + $elemente[$i].className + " ";
				var re = new RegExp(" " + $classname + " ", "g");
				$classes = $classes.replace( re, " " );
				$elemente[$i].className = trim($classes);
			}
		}
	}
 }

/**
 * 
 * 
 * @param {type} $element
 * @param {type} $classname
 * @returns {undefined}
 * 
 * @version 4.0 Elemente werden nur noch gepusht, wenn sie mittels getElementById geholt werden konnten
 */
function toggleClass( $element, $classname )
{
	var $elemente = new Array();
	if( "string" === typeof($element) )
	{
		if( "." !== $element.substr(0, 1) )
		{
     var t_elem = document.getElementById($element);
     if (t_elem != null)
     {
      $elemente.push(t_elem);
     }
		}
		else
		{
			var $classelemente = document.getElementsByClassName($element.substr(1));
			for( var $i=0; $i<$classelemente.length; $i++ )
			{
				$elemente.push( $classelemente[$i] );
			}
		}
	}
	else
	{
		$elemente.push($element);
	}
	
	for( $i=0; $i<$elemente.length; $i++ )
	{
		if( hasClass( $elemente[$i], $classname ) )
		{
			removeClass( $elemente[$i], $classname );
		}
		else
		{
			addClass( $elemente[$i], $classname );
		}
	}
}
 

function hasData( $pm_element, $ps_data )
 {
	var $element = $pm_element;
	if( "string" === typeof($element) ) { $element = document.getElementById($element); }
	
	if( "object" !== typeof($element) || "undefined" === $ps_data )
	 {
		return false;
	 }
	
	var $tmp_attribute = html5_data_attribute($ps_data);
	var $tmp_attr = $element.attributes;
	for( var $i = 0; $i < $tmp_attr.length; $i++ )
	 {
		var $attr = $tmp_attr.item($i);
		if( $attr.nodeName.match( "data-" + $tmp_attribute ) )
		 {
			return true;
		 }
	 }
	 
	return false;
 }
 
function addData( $pm_element, $ps_data, $pm_value )
 {
	var $element = $pm_element;
	if( "string" === typeof($element) ) { $element = document.getElementById($element); }
	
	if( "object" !== typeof($element) || "undefined" === $ps_data || "undefined" === $pm_value )
	 {
		return false;
	 }
	
	var $tmp_attribute = html5_data_attribute($ps_data);
	$element.setAttribute( "data-" + $tmp_attribute, $pm_value );
 }
 
function getData( $pm_element, $ps_data )
 {
	var $element = $pm_element;
	if( "string" === typeof($element) ) { $element = document.getElementById($element); }
	
	if( "object" !== typeof($element) || "undefined" === $ps_data )
	 {
		return false;
	 }
	 
	// Keine Attribute setzen bei text, comment und attribute nodes
	if( $element.nodeType === 3 || $element.nodeType === 8 || $element.nodeType === 2 )
	{
		return;
	}
	
	var $tmp_attribute = "data-" + html5_data_attribute($ps_data);
	var $attribute = null;
	
	if( "function" === typeof($element.getAttribute) )
	{
		$attribute = $element.getAttribute($tmp_attribute);
	}
	else if( "undefined" !== typeof($element.attributes) )
	{
		var $tmp_attr = $element.attributes;
		if( "function" === typeof($tmp_attr.length) )
		{
			for( var $i = 0; $i < $tmp_attr.length; $i++ )
			{
				var $attr = $tmp_attr.item($i);
				if( $attr.nodeName.match( $tmp_attribute ) )
				{
					$attribute = $attr.nodeValue;
					break;
				}
			}
		}
	}
	
	return $attribute;
 }
 
function removeData( $pm_element, $ps_data )
 {
	var $element = $pm_element;
	if( "string" === typeof($element) ) { $element = document.getElementById($element); }
	
	if( "object" !== typeof($element) )
	 {
		return false;
	 }
	
	var $tmp_attribute = html5_data_attribute($ps_data);
	$element.removeAttribute( "data-" + $tmp_attribute );
 }
 
function html5_data_attribute( $ps_attribut )
 {
	var $tmp_str = "";
	var $tmp_char = "";
	for( $i=0; $i<$ps_attribut.length; $i++ )
	 {
		$tmp_char = $ps_attribut.substr($i,1);
		if( "A" <= $tmp_char && "Z" >= $tmp_char )
		 {
			$tmp_str = $tmp_str + "-" + ($tmp_char.toLowerCase());
		 }
		else
		 {
			$tmp_str = $tmp_str + $tmp_char;
		 }
	 }
	 
	return $tmp_str;
 }
 
 
function forEach($pa_array, $po_func_callback)
{
	if( ( ("object" !== typeof($pa_array) || !($pa_array instanceof Array))
		&& "array"  !== typeof($pa_array) )
	 || "function" !== typeof($po_func_callback) )
	{
		return false;
	}
	
	for( var i = 0; i < $pa_array.length; i++ )
	{
		$po_func_callback($pa_array[i], i);
	}
	return true;
}
 

/**
 * Löscht das aktuelle Element, auf das der Doppelklick abgefangen werden soll.
 * Wichtig für Formulare, damit diese nach einer Datenfehlerüberorüfung ordnungs-
 * gemäß wieder erreichbar/nutzbar sind!
 * 
 * @returns -
 */
function reset_doubleclick_watcher()
 {
	$document_element_dblclick_watcher = null;
 }


/**
 * Definiert die korrekte Mausposition auf dem Bildschirm, abhängig vom zugrunde-
 * liegenden Browser und gibt diese als Array(top, left) zurück.
 * 
 * @param	event
 */
function get_mouse_position(event)
 {
  if(!event) event = window.event;
  var body = (window.document.compatMode && window.document.compatMode == "CSS1Compat") ? window.document.documentElement : window.document.body;

	return {
   top: event.pageY ? event.pageY : event.clientY + body.scrollTop - body.clientTop,
   left: event.pageX ? event.pageX : event.clientX + body.scrollLeft  - body.clientLeft
	};
 }
 
 
 
function gruppe_einblenden( $ps_id, $pa_gruppen )
 {
	var $ele = null;
	for( var $i=0; $i<$pa_gruppen.length; $i++ )
	 {
		$ele = document.getElementById( "gruppe_" + $pa_gruppen[$i] );
		if( $ele )
		 {
			$ele.style.display = 'none';
		 }
	 }
	 
	$ele = document.getElementById( "gruppe_" + $ps_id );
	if( $ele )
	 {
		$ele.style.display = 'block';
	 }
 }
 
 
function element_toggle( $ps_id, $pb_state, $ps_value, $label )
 {
	$value = null;
	if( "undefined" !== typeof($ps_value) )
	 {
		$value = $ps_value;
	 }
	$state = null;
	if( "undefined" !== typeof($pb_state) )
	 {
		$state = true===$pb_state;
	 }
   
	if( "undefined" === typeof $label )
	 {
		$label = [{
     label_element: '',
     state_true: '',
     state_false: ''
    }];
	 }
	
	var $ele = null;
	$ele = document.getElementById( $ps_id );
	if( $ele )
	 {
		if( $ele.style.display !== 'none' && ( null === $state || false === $state ) )
		 {
			$value = 'none';
		 }
		else
		 {
			if( "TR" === $ele.tagName )
			 {
				if( null === $value )
				 {
					$value = 'table-row';
				 }
			 }
			else if( "SPAN" === $ele.tagName )
			 {
				if( null === $value )
				 {
					$value = 'inline';
				 }
			 }
			else if( "LI" === $ele.tagName )
			 {
				if( null === $value )
				 {
					$value = 'list-item';
				 }
			 }
			else if( "TD" === $ele.tagName || "TH" === $ele.tagName )
			 {
				if( null === $value )
				 {
					$value = 'table-cell';
				 }
			 }
			else if( "THEAD" === $ele.tagName )
			 {
				if( null === $value )
				 {
					$value = 'table-header-group';
				 }
			 }
			else if( "TBODY" === $ele.tagName )
			 {
				if( null === $value )
				 {
					$value = 'table-row-group';
				 }
			 }
			else if( "TFOOT" === $ele.tagName )
			 {
				if( null === $value )
				 {
					$value = 'table-footer-group';
				 }
			 }
       else if( "TABLE" === $ele.tagName )
			 {
				if( null === $value )
				 {
					$value = 'table';
				 }
			 }
			else
			 {
				if( null === $value )
				 {
					$value = 'block';
				 }
			 }
		 }
		 
		
		if( null !== $value )
		 {
			$ele.style.display = $value;
      
		/* Beschriftung aendern */
		if( null !== $label && $label.length > 0 )
		{
			for (var li=$label.length-1; li>=0; li--)
			 {
				if( "" === $label[li].label_element )
				 {
					continue;
				 }
				$label_ele = document.getElementById( $label[li].label_element );
				if( $label_ele )
				 {
					if($ele.style.display !== 'none')
					{
					 if ($label[li].state_true.length > 0)
					 {
					  $label_ele.innerHTML = $label[li].state_true;
					 }
					}
					else
					{
					 if ($label[li].state_false.length > 0)
					 {
					  $label_ele.innerHTML = $label[li].state_false;
					 }
					}
				 }
			 }
		}
		/* Ende Beschriftung */
      
		 }
	 }
	 
	return false;
 }
 
/**
 * Speichern Aller Navigationseinträge mit offenen Menüleisten.
 * 
 * @type Array<HTMLNode>
 */
var $GCA_SUBMENUE_OPEN = new Array();
/**
 * Schließt alle offnen Untermenüs der Menüleiste.
 * 
 * @returns {void}
 */
function schliesseAlleUntermenuepunkte()
{
	// Erst werden alle Untermenüs geschlossen und danach
	for( var $key in $GCA_SUBMENUE_OPEN )
	{
		schliesseUntermenue( $GCA_SUBMENUE_OPEN[$key] );
	}
	// Wird das Feld geleert, damit neue aufgenommen werden können.
	$GCA_SUBMENUE_OPEN = new Array();
}
/**
 * Schließt ein konkretes Untermenü, wobei der Referenzwert immer der 
 * übergeordnete Navigationseintrag sein muss!
 * 
 * @param {HTMLNode} $Navigationseintrag
 * @returns {Boolean}
 */
function schliesseUntermenue( $Navigationseintrag )
{
	var naechstes_element = $Navigationseintrag.nextSibling;
	if( 'UL' === naechstes_element.nodeName && 'block' === naechstes_element.style.display )
	{
		naechstes_element.style.display = 'none';
		removeClass($Navigationseintrag, 'aktiv');
		$Navigationseintrag.blur();
	}
	return false;
}
/**
 * Stellt das Untermenü von einem Menüpunkt dar.
 * 
 * @param {HTMLNode} element
 * @returns {Boolean}
 */
function show_submenu( element )
{
	var naechstes_element = element.nextSibling;
	if( 'UL' === naechstes_element.nodeName && 'block' === naechstes_element.style.display )
	{
		naechstes_element.style.display = 'none';
		removeClass(element, 'aktiv');
		element.blur();
	}
	else if( 'UL' === naechstes_element.nodeName )
	{
		// Erst machen wir alle Untermenüs zu und dann fügen wir das neu aufgemachte
		// hinzu!
		schliesseAlleUntermenuepunkte();
		
		naechstes_element.style.display = 'block';
		addClass(element, 'aktiv');
		$GCA_SUBMENUE_OPEN.push( element );
	}
	return false;
}

function trim( str )
 {
	return str.replace(/^\s+|\s+$/g,'');
 }
 
function insertAfter(newNode, referenceNode)
 {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
 }
 
function html_in_sonderzeichen( $ps_str )
 {
	if( "undefined" === typeof($ps_str) || $ps_str === null || $ps_str.length === 0 )
	 {
		return "";
	 }
	 
	var $str = $ps_str;
	
	$str = $str.replace("&auml;", "ä");
	$str = $str.replace("&ouml;", "ö");
	$str = $str.replace("&uuml;", "ü");
	$str = $str.replace("&Auml;", "Ä");
	$str = $str.replace("&Ouml;", "Ö");
	$str = $str.replace("&Uuml;", "Ü");
	$str = $str.replace("&szlig;", "ß");
	 
	return $str;
 }

var GCI_AJAX_READYSTATE_UNSENT = 0; // open() wurde noch nicht aufgerufen
var GCI_AJAX_READYSTATE_OPENED = 1; // send() wurde noch nicht aufgerufen
var GCI_AJAX_READYSTATE_HEADERS_RECEIVED = 2; // send() aufgerufen; Headers und Status verfügbar
var GCI_AJAX_READYSTATE_LOADING = 3; // Download läuft - responseText enthält Teildaten
var GCI_AJAX_READYSTATE_DONE = 4; // Abgeschlossen
// 2014-12-10 Funktion zum Erstellen eines AJAX-Objekts
function get_ajax_request()
{
	var ajax_request = false;
	try // Mozilla
	{
		ajax_request = new XMLHttpRequest();
	}
	catch(e)
	{
		try // IE 6
		{
			ajax_request = new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch(e)
		{
			try // IE 5
			{
				ajax_request = new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch(e) 
			{
				// Kein xhttp-Objekt vorhanden
			}
		}
	}
  
	return ajax_request;
}

/*
 Globale Variable zum Speichern eines ggf. schon belegten onclick-Ereignisses. Damit
 kann es neu zugewiesen werden und wir können die gespeicherte Funktion innerhalb 
 ausführen. So bleiben beide Versionen erhalten und wir können einige Klicks auf der 
 Oberfläche abfangen:
 - Doppelklicks auf Elemente, die die Klasse (no-dblclick) besitzen werden verhindert
*/
var $document_element_dblclick_watcher = null;

var initMainisCalendar = function() {
 $elemente = document.getElementsByClassName("frmDatum");
	for( var $i=0; $i<$elemente.length; $i++ )
	 {
		var $tmp_span = document.createElement("span");
		$tmp_span.textContent = "Calendar";
		$tmp_span.className = "icon icon-calendar";
		// Daten auf das Kalender-Symbol übertragen:
		var $tmp_obj = mJS( $tmp_span );
		var $tmp_obj2 = mJS( $elemente[$i] );
		$tmp_obj.data("calendar-id", $tmp_obj2.data("calendar-id"));
		$tmp_obj.data("calendar-format", $tmp_obj2.data("calendar-format"));
		$tmp_obj.data("calendar-display-time", $tmp_obj2.data("calendar-display-time"));
		$tmp_obj.data("calendar-time-input", $tmp_obj2.data("calendar-time-input"));
		// Klick Ereigbnis binden:
		$tmp_span.onclick = function() {
			var $tmp_obj = mJS( this );
			var $inputField = document.getElementById($tmp_obj.data("calendar-id"));
			var $format = $tmp_obj.data("calendar-format");
			var $buttonObj = this;
			var $displayTime = $tmp_obj.data("calendar-display-time");
			var $timeInput = $tmp_obj.data("calendar-time-input");
			
			displayCalendar($inputField, $format, $buttonObj, $displayTime, $timeInput);
		};

		insertAfter( $tmp_span, $elemente[$i] );
	 }
};

addIVENAListener("load", window, function(  ) {
	document.onclick = function( event )
	 {
		event = event || window.event;

		var $target_element = (event.originalTarget) ? event.originalTarget : event.srcElement;
		
		if( $target_element
		 && ( hasClass($target_element, 'no-dblclick')
		   || hasClass($target_element, 'nodblclick')
		   || hasClass($target_element, 'nodc')
			)
		  )
		 {
			// Wenn das Zielelement bereits im Zwischenspeicher liegt 
			// und die Linke Maustaste gedrückt wurde
			if( $document_element_dblclick_watcher === $target_element
			 && 0 === event.button )
			 {
				if (event && event.preventDefault)
				 {
					event.preventDefault();
				 }
				else if (event && event.returnValue)
				 {
					event.returnValue = false;
				 }
				return false;
			 }
			$document_element_dblclick_watcher = $target_element;
		 }
		else
		 {
			$document_element_dblclick_watcher = null;
		 }
	 };
	 
	initMainisCalendar();
});

addIVENAListener("mousedown", window, function( event ) {
	$global_mouse_event_down = event || window.event;
});

var ajax_syncstatus_master = null;
function synchronisation_status_master( $ps_si )
{
	if( null === ajax_syncstatus_master )
	{
		ajax_syncstatus_master = get_ajax_request();
	}
	
	// Wenn die Anfrage bereits geschickt wurde:
	if( ajax_syncstatus_master.readyState > GCI_AJAX_READYSTATE_OPENED && "function" === typeof(ajax_syncstatus_master.onabort) )
	{
		ajax_syncstatus_master.abort();
	}
	
	var $box = document.getElementById("syncstatus_master_box");
	var $box_content = document.getElementById("syncstatus_master_content");
	element_toggle("syncstatus_master_box", true, "block", null);
	
	$box_content.innerHTML = $GCS_LOCALE_WINDOW_AJAX_LOAD_IMAGE;
 show_loading_animation();
	ajax_syncstatus_master.open("GET", "ajax_get_syncstatus.php?aktion=master_zu_slave&si=" + $ps_si+"&rnd=" + Math.random());
	ajax_syncstatus_master.onreadystatechange = function() {
		if (ajax_syncstatus_master.readyState === 4) 
		 {
   hide_loading_animation();
			var response = ajax_syncstatus_master.responseText;
			try
			 {
				response = ( typeof(JSON) != 'undefined' ? JSON.parse(response) : eval("(" + response + ")") );
				/* console.debug(response); */

				if( response.errno === 0 )
				 {
					 $box_content.innerHTML = response.data;
				 }
				else
				 {
					 $box_content.innerHTML = response.error;
				 }
			 }
			catch( error )
			 {
				//
			 }
		 }
	 };
	ajax_syncstatus_master.send();
}


/**
 * Sucht alle Checkboxen innerhalb eines Bereichs und fasst sie zu einer 
 * Checkboxgroup zusammen. Wird der Parameter $ps_class nicht übergeben, so werden
 * automatisch alle Checkboxen in diese virtuelle Gruppe aufgenommen, ansonsten
 * werden nur die Checkboxen hinzugefügt, die auch diese Klasse besitzen.
 * Der Parameter $po_container kann entweder ein HTML-Element sein (z.B. document)
 * aber auch der ID-String eines Elements.
 * 
 * Wenn eine Checkbox der ganzen Gruppe nicht aktiviert ist bewirkt der erste 
 * Klick auf den Button die Aktivierung aller Boxen und erst der zweite deaktiviert
 * alle in der Gruppe befindlichen Checkboxen.
 * 
 * Über das Data-Attribut "checkboxgroup" := false kann man die Checkbox aus der
 * Gruppe dynamisch entfernen
 * 
 * @param {HTMLNode} $po_container
 * @param {string} $ps_class
 * @param {HTMLNode} $po_sender
 * @returns {Boolean|null}
 */
function toggleAllCheckboxes( $po_container, $ps_class, $po_sender )
{
	var $container = $po_container;
	var $class = $ps_class;
	
	if( "undefined" === typeof($container) )
	{
		return null;
	}
	if( "string" === typeof($container) )
	{
		$container = document.getElementById($container);
	}
	if( "string" !== typeof($class) )
	{
		$class = null;
	}
	if( !$container )
	{
		return null;
	}
	
	var chk = $container.getElementsByTagName('input');
	var $chk_group = new Array();
	var $len = chk.length;
	var $one_unchecked = false;
	
	for (var i = 0; i < $len; i++)
	{
		if( hasData(chk[i], "checkboxgroup") === "false" )
		{
			 continue;
		}
		
		if( chk[i].type === 'checkbox'
		 && (null === $class || hasClass(chk[i], $class))
		  )
		{
			$chk_group.push( chk[i] );
			// direkt mit prüfen ob ggf. eine Checkbox bisher nicht aktiviert ist
			if( false === chk[i].checked )
			{
				$one_unchecked = true;
			}
		}
	}
	
	$len = $chk_group.length;
	var $status_checked = false;
	if( $one_unchecked ) { $status_checked = true; }
	
	for( var i = 0; i < $len; i++ )
	{
		$chk_group[i].checked = $status_checked;
		element_send_onchange( $chk_group[i] );
	}
	
	if( "undefined" !== typeof($po_sender) && "input" === $po_sender.tagName )
	{
		$po_sender.checked = $status_checked;
	}
	
	return $status_checked;
}

/**
 * Checkboxgruppen symbolisieren eine Einheit und besitzen in der Regel einen
 * Schalter um alle Boxen mit einem Ereignis zu beeinflussen.
 * Dafür ist es notwendig, dass alle beteiligten Checkboxen diesselbe Klasse
 * besitzen. Alle Checkboxen die im Besitz dieser Klasse sind, bilden auch die
 * Gruppe! Ggf. daher auf eindeutige Namen ausweichen!
 * 
 * Eine Seperate Checkbox übernimmt die Rolle, alle zu beeinflussen sowie den
 * Status der Gruppe zu repräsentieren.
 * Ist keine Checkbox angehakt, so ist auch diese Checkbox nicht aktiviert, sind
 * x Elemente aktiviert, aber es gilt x < n, wobei n die Summe aller Checkboxen
 * in der Gruppe darstellt, dann ist die Checkbox ebenfalls nicht aktiviert, aber
 * ist im "Indeterminate"-Modus (Je nach OS eine voll ausgefüllte Checkbox, 
 * allerdings kein Haken!). Sobald wirklich alle Checkboxen aktiviert sind, ist
 * auch die Verbundcheckbox aktiviert.
 */

/**
 * Erstellt aus einer übergebenen Klassendefinition und einer ID von einer 
 * seperaten, repräsentativen Checkbox eine Gruppendefinition. Diese Gruppe 
 * besitzt eine Verbindung untereinander. Die repräsentative Checkbox stellt 
 * sowohl den Gruppenstatus visuell dar und beeinfluss die Gruppe über den 
 * eigenen Status.
 * 
 * @version 1.0
 * 
 * @deprecated @since 4.2.34 bitte nicht weiter verwenden
 * @param {string} $ps_checkbox_class
 * @param {string} $ps_checkbox_select_all_id
 * @returns {void}
 */
function checkboxgruppe_erstellen( $ps_checkbox_class, $ps_checkbox_select_all_id )
{
	var $checkbox_all = document.getElementById($ps_checkbox_select_all_id);
	if( !$checkbox_all ) { $checkbox_all = null; }
	var $alle_checkboxen = document.getElementsByClassName($ps_checkbox_class);
	
	for( $i=0; $i<$alle_checkboxen.length; $i++ )
	{
		addIVENAListener("click", $alle_checkboxen[$i], function($po_event) {
		var $event = $po_event || window.event;
		
			if( null !== $checkbox_all )
			{
				var $all_checkboxes_checked = allCheckboxesChecked($ps_checkbox_class);

				if( "number" === typeof($all_checkboxes_checked) )
				{
					$checkbox_all.checked = false;
					$checkbox_all.indeterminate = true;
				}
				else
				{
					$checkbox_all.checked = $all_checkboxes_checked;
					$checkbox_all.indeterminate = false;
				}
				element_send_onchange( $checkbox_all );
			}
		});
	}

	if( null !== $checkbox_all )
	{
		addIVENAListener("click", $checkbox_all, function($po_event) {
			var $event = $po_event || window.event;
			
			$checkbox_all.indeterminate = false;
			
			var $alle_checkboxen = document.getElementsByClassName($ps_checkbox_class);
			for( $i=0; $i<$alle_checkboxen.length; $i++ )
			{
				$alle_checkboxen[$i].checked = $checkbox_all.checked;
			}
		});
	}
}



function checkboxgruppen( $po_initelemente )
{
	addIVENAListener("click", window, function($po_event) {
		var $event = $po_event || window.event;
		var $target = getEventTarget($event);
		
		if( hasClass($target, "checkboxgruppe") )
		{
			eventCheckboxGroup( $event, $target );
		}
	});
	addIVENAListener("ivenaCHBGroupClick", window, function($po_event) {
		var $event = $po_event || window.event;
		var $target = getEventTarget($event);
		
		eventCheckboxGroup( $event, $target );
	});
	addIVENAListener("ivenaCHBGroupUnClick", window, function($po_event) {
		var $event = $po_event || window.event;
		var $target = getEventTarget($event);
		
		eventCheckboxGroup( $event, $target );
	});
	addIVENAListener("ivenaCHBGroupChange", window, function($po_event) {
		var $event = $po_event || window.event;
		var $target = getEventTarget($event);
		
		eventCheckboxGroup( $event, $target );
	});
	addIVENAListener("ivenaCHBGroupInitialize", window, function($po_event) {
		var $event = $po_event || window.event;
		var $target = getEventTarget($event);
		
		eventCheckboxGroup( $event, $target );
	});
	
	checkboxgruppen_initialisierung( $po_initelemente );
}

function checkboxgruppen_initialisierung( $pa_elemente )
{
	if( !($pa_elemente instanceof Array) )
	{
		return false;
	}
	addIVENAListener("load", window, function($po_event) {
		$tmp_event = mainis_createEvent("ivenaCHBGroupInitialize", {
			bubbles: true,
			cancelable: true,
			detail: {
				target: $pa_elemente[$i]
			}
		});
		
		var $i = 0;
		for( $i=0; $i<$pa_elemente.length; $i++ )
		{
			eventCheckboxGroup( $tmp_event, $pa_elemente[$i] );
		}
	});
}

function mainis_createEvent( $ps_eventname, $po_details )
{
	var $tmp_event = null;
	var $b_bubble = false;
	var $b_cancelable = false;
	var $o_details = {};
	
	if( $po_details.bubbles ) { $b_bubble = $po_details.bubbles; }
	if( $po_details.cancelable ) { $b_cancelable = $po_details.cancelable; }
	if( "object" === typeof($po_details.detail) ) { $o_details = $po_details.detail; }
	
	if( document.createEvent )
	{
		$tmp_event = document.createEvent("CustomEvent");
		$tmp_event.initCustomEvent($ps_eventname, $b_bubble, $b_cancelable, $o_details);
	}
	else if( "function" === typeof(CustomEvent) || "object" === typeof(CustomEvent) )
	{
		$tmp_event = new CustomEvent($ps_eventname, $po_details);
	}
	
	return $tmp_event;
}

function eventCheckboxGroup( $po_event, $po_inputelement )
{
	if( !$po_inputelement )
	{
		return false;
	}
	if( $po_event.stopPropgation ) { $po_event.stopPropagation(); }
	else { $po_event.cancelBubble = true; }
	
	var $i = 0;
	var $css_gruppenelemente = getData($po_inputelement, "chbgroup-group");
	var $gruppenelemente = null;
	if( $css_gruppenelemente && $css_gruppenelemente.length > 0 )
		{ $gruppenelemente = document.getElementsByClassName($css_gruppenelemente); }
	
	var $css_elternelemente = getData($po_inputelement, "chbgroup-parent");
	var $elternelemente = null;
	if( $css_elternelemente && $css_elternelemente.length > 0 )
		{ $elternelemente = document.getElementsByClassName($css_elternelemente); }
	
	var $ist_checkboxall = ("true" === getData($po_inputelement, "chbgroup-is-all"));

	var $zukuenftiger_status_der_unteren_checkboxgruppe = true;
	var $tmp_event = null;
	var $eventtype = "ivenaCHBGroupClick";
	
	var $allCheckboxesChecked = null;
	
	if( "click" === $po_event.type )
	{
		if( null !== $gruppenelemente )
		{
			// 1. Schritt: Herausfinden des Gruppenstatus:
			$status_der_gruppe = allCheckboxesChecked($css_gruppenelemente);
			if( $status_der_gruppe === true )
			{
				$zukuenftiger_status_der_unteren_checkboxgruppe = false;
				$eventtype = "ivenaCHBGroupUnClick";
			}
			if( 0 < $po_inputelement.length )
			{
				$po_inputelement.checked = $zukuenftiger_status_der_unteren_checkboxgruppe;
			}
			
			
			// 2. Schritt: Alle Unteren Elemente ein customEvent schicken, dass sie
			// sich checken sollen
			for( $i=0; $i<$gruppenelemente.length; $i++ )
			{
				$tmp_event = mainis_createEvent($eventtype, {
					bubbles: true,
					cancelable: true,
					detail: {
						target: $gruppenelemente[$i]
					}
				});
				window.dispatchEvent($tmp_event);
			}
		}
		
		if( null !== $elternelemente )
		{
			for( $i=0; $i<$elternelemente.length; $i++ )
			{
				$tmp_event = mainis_createEvent("ivenaCHBGroupChange", {
					bubbles: false,
					cancelable: true,
					detail: {
						target: $elternelemente[$i]
					}
				});
				window.dispatchEvent($tmp_event);
			}
		}
	}
	else if( "ivenaCHBGroupChange" === $po_event.type )
	{
		$allCheckboxesChecked = allCheckboxesChecked($css_gruppenelemente);
		
		$po_inputelement.checked = false;
		$po_inputelement.indeterminate = false;
		
		/* console.log( $po_inputelement ); */
		
		if( true === $allCheckboxesChecked )
		{
			$po_inputelement.checked = true;
		}
		else if( false !== $allCheckboxesChecked && 0 !== $allCheckboxesChecked )
		{
			$po_inputelement.indeterminate = true;
		}
		
		if( null !== $elternelemente )
		{
			for( $i=0; $i<$elternelemente.length; $i++ )
			{
				$tmp_event = mainis_createEvent("ivenaCHBGroupChange", {
					bubbles: false,
					cancelable: true,
					detail: {
						target: $elternelemente[$i]
					}
				});
				window.dispatchEvent($tmp_event);
			}
		}
	}
	else if( "ivenaCHBGroupClick" === $po_event.type )
	{
		$po_inputelement.checked = true;
		$po_inputelement.indeterminate = false;
		if( null !== $gruppenelemente )
		{
			for( $i=0; $i<$gruppenelemente.length; $i++ )
			{
				$tmp_event = mainis_createEvent("ivenaCHBGroupClick", {
					bubbles: false,
					cancelable: true,
					detail: {
						target: $gruppenelemente[$i]
					}
				});
				window.dispatchEvent($tmp_event);
			}
		}
	}
	else if( "ivenaCHBGroupUnClick" === $po_event.type )
	{
		$po_inputelement.checked = false;
		$po_inputelement.indeterminate = false;
		if( null !== $gruppenelemente )
		{
			for( $i=0; $i<$gruppenelemente.length; $i++ )
			{
				$tmp_event = mainis_createEvent("ivenaCHBGroupUnClick", {
					bubbles: false,
					cancelable: true,
					detail: {
						target: $gruppenelemente[$i]
					}
				});
				window.dispatchEvent($tmp_event);
			}
		}
	}
	else if( "ivenaCHBGroupInitialize" === $po_event.type )
	{
		if( null !== $gruppenelemente )
		{
			for( $i=0; $i<$gruppenelemente.length; $i++ )
			{
				$tmp_event = mainis_createEvent("ivenaCHBGroupInitialize", {
					bubbles: false,
					cancelable: true,
					detail: {
						target: $gruppenelemente[$i]
					}
				});
				window.dispatchEvent($tmp_event);
			}
			
			$allCheckboxesChecked = allCheckboxesChecked($css_gruppenelemente);
			//console.debug("Checkboxes Checked: ", $allCheckboxesChecked, $css_gruppenelemente);
			$po_inputelement.checked = false;
		
			if( true === $allCheckboxesChecked )
			{
				$po_inputelement.checked = true;
				$po_inputelement.indeterminate = false;
			}
			else if( false !== $allCheckboxesChecked && 0 < $allCheckboxesChecked )
			{
				$po_inputelement.indeterminate = true;
			}
		}
	}
}


/**
 * Überprüft eine Gruppe an Checkboxen (alle Mitglieder der Gruppe werden über
 * ihren Klassennamen definiert), ob keines ( := false ), ob alle ( := true) oder
 * ob nur ein Teil ( := integer - Anzahl an aktivierten ) der Checkboxen aktiviert
 * sind.
 * 
 * @version 1.0
 * 
 * @param {string} $ps_checkbox_class
 * @returns {Number|Boolean}
 */
function allCheckboxesChecked( $ps_checkbox_class )
 {
	var $alle_checkboxen = document.getElementsByClassName($ps_checkbox_class);
	
	var $anz_checked = 0;
	var $anz_indeterminated = 0;
	for( $i=0; $i<$alle_checkboxen.length; $i++ )
	{
		if( $alle_checkboxen[$i].checked )
		{
			$anz_checked++;
		}
		// Wenn die Checkbox halb gefüllt ist, bedeutet das, dass ein Feld 
		// darunter ebenfalls aktiviert sein muss.
		else if( $alle_checkboxen[$i].indeterminate )
		{
			$anz_indeterminated++;
		}
	}
	
 /*
	 Wenn die Anzahl der Checkboxen, die aktiviert sind, identisch sind, mit
	 der Gesamtanzahl der Checkboxen (auch bei 0 Checkboxen), dann sind formal
	 alle aktiviert.
	 Wenn es mehr als eine Checkbox gibt, aber keine aktiviert ist, wird der
	 Rückgabewert "false"
 */
	if( $anz_checked === $alle_checkboxen.length )
	{
		$anz_checked = true;
	}
	else if( $anz_checked !== $alle_checkboxen.length && $anz_checked === 0 )
	{
		$anz_checked = false;
	}
	
 /*
	 Wenn keine Checkbox angehakt ist, einige aber auf dem "Indeterminate"-Status
	 gesetzt sind, bedeutet das, dass durchaus etwas angehakt ist, nur keine
	 kompletten Gruppen. In diesem Fall geben wir als einzigen Negativ-Wert
	 der Funktion alle zumindest Indeterminate-Checkboxen aus. Mit einer Abfrage
	 auf den expliziten Status false UND die Abfrage ob das Ergebnis !== 0 ist
	 erhält man die genaue Information, ob der Status Indeterminate sein muss
	 oder nicht.
 */
	if( false === $anz_checked )
	{
		$anz_checked = -$anz_indeterminated;
	}
	 
	return $anz_checked;
 }


/**
 * Sendet ein onChange-Ereignis an ein Element.
 * 
 * @param {object} $po_element
 * @returns {Boolean}
 */
function element_send_onchange( $po_element )
 {
	if ("createEvent" in document && $po_element)
	 {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("change", false, true);
		$po_element.dispatchEvent(evt);
		return true;
	 }
	else
	 {
		return false;
	 }
 }


/**
 * Sendet ein onClick-Ereignis an ein Element.
 * 
 * @param {object} $po_element
 * @returns {Boolean}
 */
function element_send_onclick( $po_element )
 {
	if ("createEvent" in document && $po_element)
	 {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("click", false, true);
		$po_element.dispatchEvent(evt);
		return true;
	 }
	else
	 {
		return false;
	 }
 }


/**
 * Schaltet eine kleine Gruppe von Checkboxen. Wenn keine oder mind. eine, aber 
 * nicht alle aktiviert sind, werden alle aktiviert. Wenn alle aktiviert sind,
 * werden sie deaktiviert.
 * 
 * @param {String} $ps_cbgroup_class
 * @deprecated @since 4.2.34 bitte nicht weiter verwenden
 * @returns {Boolean}
 */
function toggleCheckboxGroup( $ps_cbgroup_class )
 {
	var $all_checked = allCheckboxesChecked($ps_cbgroup_class);
	var $set_all = true;
	var $alle_cbs = document.getElementsByClassName($ps_cbgroup_class);
	
	if( 0 === $alle_cbs.length )
	{
		return false;
	}
	 
	if( true === $all_checked ) { $set_all = false; }
	
	for( $i=0; $i < $alle_cbs.length; $i++ )
	{
		$alle_cbs[$i].checked = $set_all;
	}
	// Wir informieren alle Checkboxen, dass sich ihr Status geändert hat!
	for( $i=0; $i < $alle_cbs.length; $i++ )
	{
		element_send_onchange( $alle_cbs[$i] );
	}
	/*
	 Der Firefox reagiert nur auf ein onclick-Ereignis und ignoriert onchange-Ereignisse
	 auf checkboxen! Wenn wir allerdings nur ein Event absetzen führt das im
	 Internet Explorer dazu, dass die Checkbox deaktiviert wird! Als Workaround
	 setzen wir das Event zwei mal ab, somit erreichen wir unser Ziel.
 */
	element_send_onclick( $alle_cbs[0] );
	element_send_onclick( $alle_cbs[0] );
 }

function show_gruppe( $ps_klasse, $ps_show_elementid )
 {
	var $alle_elemente = document.getElementsByClassName($ps_klasse);
	if( $alle_elemente && $alle_elemente.length > 0 )
	 {
		for( var $i=0; $i<$alle_elemente.length; $i++ )
		 {
			if( !hasClass($alle_elemente[$i], "hide") )
			 {
				addClass($alle_elemente[$i], "hide");
			 }
		 }
	 }
	 
	if( "string" === typeof($ps_show_elementid) )
	 {
		removeClass($ps_show_elementid, "hide");
	 }
 }
 
function showBigAnimation( $ps_title, $ps_text, $ps_text_title )
{
	var $title = $ps_title;
	var $text_title = $ps_text_title;
	var $text_text = $ps_text;
	if( "undefined" === typeof($title) || "" === $title ) { $title = $GCS_LOCALE_WINDOW_BIGLOADER_TITLE; }
	if( "undefined" === typeof($text_title) || "" === $text_title ) { $text_title = $GCS_LOCALE_WINDOW_BIGLOADER_TEXT_TITLE; }
	if( "undefined" === typeof($text_text) || "" === $text_text ) { $text_text = $GCS_LOCALE_WINDOW_BIGLOADER_TEXT_TEXT; }
	
	var ps_title = $title,
		po_content =
		{
			text: "<h6>"+$text_title+"</h6><p>"+$text_text+"</p>"
		},
		po_options = {
			windowClasses: "frmIVENA-BigLoader",
			windowModal: true
		};
	return createWindow(ps_title, po_content, po_options);
}

function hideBigAnimation( $ps_window_element ) {
	$window_element = $ps_window_element;
	if( "string" === typeof($window_element) )
	{
		$window_element = document.getElementById($window_element);
	}
	
	if( $window_element )
	{
		$window_element.parentNode.removeChild($window_element);
	}
}


function createWindow($ps_title, $po_content, $po_options) {   
	var $options = $po_options;
	if( "object" !== typeof($options) ) { $options = {}; }
	if( "object" === typeof($po_content) ) { $options.windowContent = $po_content; }
	if( "string" === typeof($po_content) ) { $options.windowContent = { text: $po_content, url: "" }; }
	
	$options = validateWindowOptions( $options );
	if( "string" === typeof($ps_title) ) { $options.windowTitle = $ps_title; }
	
	var $id = "W" + (new Date().getTime()).toString(16);
	var $new_window = document.createElement("div");
	$new_window.setAttribute("id", "appWindow-"+$id);
	//$new_window.setAttribute("draggable", true);
	$new_window.setAttribute("ondragstart", "windowEventDrag(event);");
	var $windowClasses = "frmIVENA-Window";
	if( $options.isFixed )
	{
		$windowClasses += " pos-fixed";
	}
	if( $options.windowClasses.length > 0 )
	{
		$windowClasses += " " + $options.windowClasses;
	}
	
	
	// Load Content from AJAX-URL, if given:
	if( $options.windowContent.url.length > 0 )
	{
		$windowClasses += " loading";
		addData($new_window, "window-ajax-url", $options.windowContent.url);
	}

	$new_window.setAttribute("class", $windowClasses);
	if( 0 < $options.windowTop ) { $new_window.style.top = $options.windowTop + "px"; $new_window.style.marginTop = "0px"; }
	if( 0 < $options.windowLeft ) { $new_window.style.left = $options.windowLeft + "px"; $new_window.style.marginLeft = "0px"; }
	if( 0 < $options.windowWidth ) { $new_window.style.width = $options.windowWidth + "px"; }
	if( 0 < $options.windowHeight ) { $new_window.style.height = $options.windowHeight + "px"; }
	
	var $new_window_html = "<div class=\"inner\">";
		$new_window_html += "<div class=\"header\">";
		/*	$new_window_html += "<img class=\"window-logo\" src=\""+$options.windowIcon+"\" alt=\"WindowLogo\" />"; */
			$new_window_html += "";
			$new_window_html += "<span class=\"title\">";
				$new_window_html += $options.windowTitle;
			$new_window_html += "</span>";
			if( (true === $options.controls.close
			 || true === $options.controls.refresh
			 || true === $options.controls.maximize
			 || true === $options.controls.minimize)
			 && false === $options.windowModal )
			{
				$new_window_html += "<span class=\"controls\">";
					if( true === $options.controls.refresh && $options.windowContent.url.length > 0 )
					{
						$new_window_html += "<span class=\"refresh\" id=\"appWindow-"+$id+"-btnRefresh\" onclick=\"windowRefreshAction(this);\" title=\""+$GCS_LOCALE_WINDOW_CONTROLS_REFRESH+"\">"+$GCS_LOCALE_WINDOW_CONTROLS_REFRESH+"</span>";
					}
					if( true === $options.controls.maximize )
					{
						$new_window_html += "<span class=\"maximize\" onclick=\"windowMaximizeAction(this);\" title=\""+$GCS_LOCALE_WINDOW_CONTROLS_MAXIMIZE+"\">"+$GCS_LOCALE_WINDOW_CONTROLS_MAXIMIZE+"</span>";
					}
					if( true === $options.controls.minimize )
					{
						$new_window_html += "<span class=\"minimize\" onclick=\"windowMinimizeAction(this);\" title=\""+$GCS_LOCALE_WINDOW_CONTROLS_MINIMIZE+"\">"+$GCS_LOCALE_WINDOW_CONTROLS_MINIMIZE+"</span>";
					}
					if( true === $options.controls.close )
					{
						$new_window_html += "<span class=\"close\" onclick=\"windowCloseAction(this);\" title=\""+$GCS_LOCALE_WINDOW_CONTROLS_CLOSE+"\">"+$GCS_LOCALE_WINDOW_CONTROLS_CLOSE+"</span>";
					}
				$new_window_html += "</span>";
			}
		$new_window_html += "</div>";
		$new_window_html += "<div class=\"content\">";
			$new_window_html += $options.windowContent.text;
		$new_window_html += "</div>";
	$new_window_html += "</div>";
	
	$new_window.innerHTML = $new_window_html;
	document.getElementsByTagName("body")[0].appendChild($new_window);
	
	// Run AJAX-Request:
	if( $options.windowContent.url.length > 0 )
	{
		windowEventRefresh( $options.windowContent.url, $new_window );
	}
	return "appWindow-"+$id;
}


function validateWindowOptions( $po_options )
{
	var $options = $po_options;
	if( "object" !== typeof($options) )
	{
		$options = {};
	}
	
	if( "string" !== typeof($options.windowIcon) ) { $options.windowIcon = ""; } // layout/images/popup-window/logo_ivena_klein.png
	if( "string" !== typeof($options.windowClasses) ) { $options.windowClasses = ""; }
	if( "boolean" !== typeof($options.isFixed) ) { $options.isFixed = false; }
	if( "string" !== typeof($options.windowTitle) ) { $options.windowTitle = $GCS_LOCALE_WINDOW_UNTITLED; }
	if( "object" !== typeof($options.windowContent) ) { $options.windowContent = { url: "", text: "" }; }
	if( "string" !== typeof($options.windowContent.url) ) { $options.windowContent.url = ""; }
	if( "string" !== typeof($options.windowContent.text) ) { $options.windowContent.text = ""; }

	if( "boolean" !== typeof($options.windowModal) ) { $options.windowModal = false; }

	// Fenstergroessen
	if( "number" !== typeof($options.windowWidth) ) { $options.windowWidth = -1; }
	if( "number" !== typeof($options.windowHeight) ) { $options.windowHeight = -1; }
	
	// Fenster-Position (Default-Positionen)
	if( "number" !== typeof($options.windowTop) ) { $options.windowTop = -1; }
	if( "number" !== typeof($options.windowLeft) ) { $options.windowLeft = -1; }

	// Fenster-Controls
	if( "object" !== typeof($options.controls) ) { $options.controls = { close: true, maximize: false, minimize: false, refresh: true }; }
	if( "boolean" !== typeof($options.controls.close) ) { $options.controls.close = true; }
	if( "boolean" !== typeof($options.controls.maximize) ) { $options.controls.maximize = false; }
	if( "boolean" !== typeof($options.controls.minimize) ) { $options.controls.minimize = false; }
	if( "boolean" !== typeof($options.controls.refresh) ) { $options.controls.refresh = true; }
	
	return $options;
}

function getWindow( $po_sender )
{
	var $window = null;
	while( null !== $po_sender )
	{
		if( hasClass($po_sender, "frmIVENA-Window") )
		{
			$window = $po_sender;
			break;
		}
		$po_sender = $po_sender.parentElement;
	}
	
	return $window;
}

function getContentFromWindow( $po_window )
{
	$element = null;
	if( $po_window && hasClass($po_window, "frmIVENA-Window") )
	{
		$alle_divs = $po_window.getElementsByTagName("div");
		for( var $i=0; $i<$alle_divs.length; $i++ )
		{
			if( hasClass($alle_divs[$i], "content") )
			{
				$element = $alle_divs[$i];
				break;
			}
		}
	}
	return $element;
}

function windowCloseAction( $po_sender )
{
	var $window = getWindow( $po_sender );
	
	if( null !== $window )
	{
		$window.parentNode.removeChild( $window );
	}
}

function windowMinimizeAction( $po_sender )
{
	var $window = getWindow( $po_sender );
	/*console.debug("not implemented yet.", $window);*/
}

function windowMaximizeAction( $po_sender )
{
	var $window = getWindow( $po_sender );
	toggleClass($window, "maximized");
	
}

function windowRefreshAction( $po_sender )
{
	var $window = getWindow( $po_sender );
	var $url = getData($window, "window-ajax-url");
	if( $url.length > 0 )
	{
		addClass($window, "loading");
		windowEventRefresh($url, $window.id);
	}
}

function windowEventRefresh( $ps_url, $ps_window )
{
	var $window_id = "";
	var $window = $ps_window;
	if( "string" === typeof($window) )
	{
		$window_id = $ps_window;
		$window = document.getElementById($ps_window);
	}
	else
	{
		$window_id = $ps_window.id;
	}

	if( $window )
	{
		var $content = getContentFromWindow($window);
		$content.innerHTML = $GCS_LOCALE_WINDOW_AJAX_LOAD;
		addClass($window_id+"-btnRefresh", "hide");
		
		var $ajax_window_content_request = get_ajax_request();
		$ajax_window_content_request.open("GET", $ps_url);
		$ajax_window_content_request.onreadystatechange = function()
		{
			if ($ajax_window_content_request.readyState === 4) 
			{
				var $element = document.getElementById($window_id);
				var $response = $ajax_window_content_request.responseText;
				removeClass($element, "loading");
				removeClass($window_id+"-btnRefresh", "hide");
				var $content = getContentFromWindow($element);
				if( $content )
				{
					$content.innerHTML = $response;
				}
			}
		};
		$ajax_window_content_request.send("");
	}
}

function windowEventDrag(ev) {
 ev.dataTransfer.setData("text", ev.target.id);
}

/**
 * Stellt die Möglichkeit zur Verfügung eine Baumansicht zu erstellen mithilfe
 * von tr's und li's. Dabei beestimmt das Attribut "data-tiefe" zu welcher Ebene
 * der Eintrag gehört und "expanded" als Klasse gibt an, ob diese Node angezeigt
 * oder ausgeblendet werden muss.
 * Die Funktion benutzt die CSS-Hilfsklasse "hide".
 * 
 * @version 1.0
 * 
 * @param {object} $po_sender
 * @returns {Boolean}
 */
function toggleTreeNode( $po_sender, $all_subnodes, $depth )
{
	var $element = null;
  var $toggle_all_subnodes = false;
  if($all_subnodes === true)
  {
   $toggle_all_subnodes = true;
  }
  
  var $toggle_depth = 1;
  var $tdepth = parseInt($depth);
  if($tdepth > 0)
  {
   $toggle_depth = $tdepth;
  }

	if( !$po_sender || "undefined" === typeof($po_sender) )
	{
		return false;
	}

	$element = $po_sender;
	while( $element )
	{
		if( "TR" === $element.tagName || "LI" === $element.tagName )
		{
			break;
		}
		$element = $element.parentNode;
	}

	if( $element.tagName === "BODY" || $element.tagName === "HTML" )
	{
		return false;
	}

	toggleClass($element, "expanded");
	if( hasClass($element, "expanded") )
	{
		expand_subnodes( $element, $toggle_all_subnodes, $toggle_depth );
	}
	else
	{
		hide_subnodes( $element, $toggle_all_subnodes, $toggle_depth );
	}
	return false;
}

/**
 * Erweitert alle Nachfolgenden Knoten, die in der Tiefe um eins erhöht sind.
 * Hat ein Knoten die CSS-Klasse "expanded" so wird dieser ebenfalls erweitert.
 * 
 * @version 1.1
 *  
 * @param {object} $po_element
 * @returns {void}
 */
function expand_subnodes( $po_element, $all_subnodes, $toggle_depth )
{
	var $elterntiefe = parseInt(getData($po_element, "tiefe"));
	var $element = $po_element.nextSibling;
	var $tiefe = null;

	while( $element )
	{
		$tiefe = parseInt(getData($element, "tiefe"));
		if( $tiefe <= $elterntiefe )
		{
			break;
		}
    
    var $max_depth = 1;
    if($toggle_depth >= 1)
    {
     $max_depth = $elterntiefe + $toggle_depth;
    }

		if( ( $tiefe > $elterntiefe && $tiefe <= $max_depth) || ($all_subnodes === true && ( $tiefe > $elterntiefe ) ) ) /* parametrisiert nach $tiefe >= $elterntiefe+1 abzufragen */
		{
			removeClass($element, "hide");
      var $new_max_depth = $max_depth-1;
			if ( hasClass($element, "expanded") && ( ($new_max_depth) > 0 )  )
			{
				expand_subnodes( $element, $all_subnodes, ($new_max_depth) );
			}
		}

		$element = $element.nextSibling;
	}
}

/**
 * Versteckt alle nachfolgenden Knoten ab diesem, die eine Höhere Tiefe besitzen.
 * 
 * @version 1.1
 * 
 * @param {object} $po_element
 * @returns {void}
 */
function hide_subnodes( $po_element, $all_subnodes )
{
	var $elterntiefe = parseInt(getData($po_element, "tiefe"));
	var $element = $po_element.nextSibling;
	var $tiefe = null;
	while( $element )
	{
		$tiefe = parseInt(getData($element, "tiefe"));
		if( $elterntiefe >= $tiefe )
		{
			break;
		}

		addClass($element, "hide");
		$element = $element.nextSibling;
	}
}

/**
 * Analog zu toggleTreeNode, allerdings werden hier die Elemente tiefer gleich dem uebergebenen Element aus dem Baum entfernt
 * @version 1.0
 * 
 * @param {object} $po_sender
 * @returns {Boolean}
 */
function deleteTreeNode( $po_sender )
{
	var $element = null;

	if( !$po_sender || "undefined" === typeof($po_sender) )
	{
		return false;
	}

	$element = $po_sender;
	while( $element )
	{
		if( "TR" === $element.tagName || "LI" === $element.tagName )
		{
			break;
		}
		$element = $element.parentNode;
	}

	if( $element.tagName === "BODY" || $element.tagName === "HTML" )
	{
		return false;
	}

  delete_subnodes( $element );
  $element.parentNode.removeChild($element);
	return false;
}

/**
 * Löscht alle nachfolgenden Knoten ab diesem, die eine Höhere Tiefe besitzen.
 * 
 * @version 1.0
 * 
 * @param {object} $po_element
 * @returns {void}
 */
function delete_subnodes( $po_element )
{
	var $elterntiefe = parseInt(getData($po_element, "tiefe"));
	var $element = $po_element.nextSibling;
	var $tiefe = null;
	while( $element )
	{
		$tiefe = parseInt(getData($element, "tiefe"));
		if( $elterntiefe >= $tiefe )
		{
			break;
		}
    
  var $telement = $element;
  $element = $element.nextSibling;
  $telement.parentNode.removeChild($telement);
	}
}

/**
 * Gibt die aktuellen Positionswerte eines Elements zurück.
 * 
 * @version 1.0
 * 
 * @param {object} $po_element
 * @returns {object} mit [top:, left:, height:, width:]
 */
function getOffsetRect( $po_element )
{
 // (1)
 var box = $po_element.getBoundingClientRect();

 var body = document.body;
 var docElem = document.documentElement;

 // (2)
 var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
 var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

 // (3)
 var clientTop = docElem.clientTop || body.clientTop || 0;
 var clientLeft = docElem.clientLeft || body.clientLeft || 0;

 // (4)
 var top  = box.top +  scrollTop - clientTop;
 var left = box.left + scrollLeft - clientLeft;
	
	var height = $po_element.offsetHeight;
	var width = $po_element.offsetWidth;
    
 return { top: Math.round(top),
  left: Math.round(left),
  bottom: Math.round(top+height),
  right: Math.round(left+width),
  height: Math.round(height),
  width: Math.round(width)
 };
}

/**
 * Erweitert den Datentyp "Number" um die Funktion padLeft(anzahl_stellen, str).
 * Diese Funktion wird wie folgt genutzt:
 * (23).padLeft(4) := "0023"
 * (23).padLeft(4, "x") := "xx23"
 * 
 * @version 1.0
 * 
 * @param {number} n
 * @param {string} str
 * @returns {string}
 */
Number.prototype.padLeft = function (n,str)
{
 return Array(n-String(this).length+1).join(str||'0')+this;
};


/**
 * Erstellt einen Zeitkalender mit aufgrund des übergebenen Start-Events, des
 * Senders und des Ziels.
 * Beim erstellen eines neuen Fensters werden alle bisherigen Fenster gelöscht,
 * damit kein AppWindow vom Zeitkalender doppelt erscheint.
 * 
 * @version 1.0
 * 
 * @param {Event} $po_event
 * @param {HTMLElement} $po_sender
 * @param {HTMLElement|string} $pm_destination
 * @param {object} $po_options
 * @returns {String} ID des AppWindow-Fensters
 */
function timeCalender( $po_event, $po_sender, $pm_destination, $po_options )
{
	var $event = $po_event || window.event;
	var $sender = $po_sender;
	var $options = $po_options;
	if( "object" !== typeof($options) ) { $options = {}; }
	var $destination = $pm_destination;
	if( "string" === typeof($destination) )
	{
		$destination = document.getElementById($destination);
	}
	var $target = getEventTarget($event);
	// --
	var $bisheriger_calender = document.getElementsByClassName("timeCalender");
	if( $bisheriger_calender )
	{
		for( var $i=0; $i<$bisheriger_calender.length; $i++ )
		{
			$bisheriger_calender[$i].parentNode.removeChild($bisheriger_calender[$i]);
		}
	}
	
	var $destination_id = $destination.getAttribute("id");
	if( !$destination_id || "" === $destination_id )
	{
		$destination_id = "timeCalender-" + (new Date().getTime()).toString(16);
		$destination.setAttribute("id", $destination_id);
	}
	$destination.setAttribute("readonly", true);
	
	var $timeCalender_appID = createTimeCalenderHTML($target, $destination_id, $options);
	return $timeCalender_appID;
}

/**
 * Erzeugt den HTML-Code für das Fenster und erstellt ein IVENA Window mit dem
 * Framework. Zurück kommt die ID des AppWindow-Fensters.
 * 
 * @version 1.0
 * 
 * @param {HTMLElement} $po_target
 * @param {String|HTMLElement} $ps_destination_id
 * @param {object} $po_options
 * @returns {String}
 */
function createTimeCalenderHTML( $po_target, $ps_destination_id, $po_options )
{
	var $target = $po_target;
	var $target_position = getOffsetRect($target);
	console.debug($target_position);
	var $options = $po_options;
	if( "object" !== typeof($options) ) { $options = {}; }
	
	var $destination_element = document.getElementById($ps_destination_id);
	var $selected_value = $destination_element.value;
	var $is_selected = false;
	
	var $html = "", $value = "";
	var $i = 0, $j = 0;
	$options.hour_start = getData($destination_element, "tcal-hour-start");
	$options.minute_start = getData($destination_element, "tcal-minute-start");
	$options.hour_end = getData($destination_element, "tcal-hour-end");
	$options.minute_end = getData($destination_element, "tcal-minute-end");
	$options.minute_step = getData($destination_element, "tcal-minute-step") || 10;
	var $timeline = get_timeline($options);
	
	$html += "<select id=\""+$ps_destination_id+"_select\">";
	forEach($timeline, function($ps_value, $pi_index) {
		$html += "<option value=\""+$ps_value+"\"";
		if( $selected_value === $ps_value )
		{
			$html += " selected=\"selected\"";
      $is_selected = true;
		}
		$html += ">";
		$html += $ps_value;
		$html += "</option>";
	});
  
  $html += "<option value=\"k. A.\"";
  if( $selected_value === "k. A." || $is_selected === false )
  {
    $html += " selected=\"selected\"";
  }
  $html += ">";
  $html += "k. A.";
  $html += "</option>";
  
	$html += "</select>";
	$html += "<input type=\"button\" value=\""+$GCS_LOCALE_WINDOW_TIMECALENDAR_BUTTON_OK+"\" onclick=\"timecalendar_event_zeitauswahl(this);\" />";
	var $window_options = {
		windowClasses: "timeCalender",
		windowTop: $target_position.top + $target_position.height,
		windowLeft: $target_position.left,
		windowWidth: 200,
		windowHeight: 60
	};
	var $window = createWindow($GCS_LOCALE_WINDOW_TIMECALENDAR_TITLE, $html, $window_options);
	addData($window, "timecalendar-id", $ps_destination_id);
	return $window;
}

/**
 * Event das ausgelöst wird, wenn eine Uhrzeit gewählt wurde. Diese setzt das 
 * verbundene Feld mit dem neuen Wert und schließt das IVENA-Window wieder.
 * 
 * @version 1.0
 * 
 * @param {HTMLElement} $po_sender
 * @returns -
 */
function timecalendar_event_zeitauswahl( $po_sender )
{
	var $sender = $po_sender;
	var $window = getWindow($sender);
	var $destination_id = getData($window, "timecalendar-id");
	document.getElementById($destination_id).value = document.getElementById($destination_id+"_select").value;
	// Fenster schließen:
	windowCloseAction($sender);
}

/**
 * Erstellt ein Feld mit allen Uhrzeiten von 00:00 - 24:00. Darüber hinaus 
 * lassen sich über Parameter die Startzeit und Endzeit, sowie die
 * Minutenschritte festlegen.
 * 
 * @version 1.0
 * 
 * @param {object} $po_options
 * @returns {Array|get_timeline.$result}
 */
function get_timeline( $po_options )
{
	var $options = $po_options;
	if( "object" !== typeof($options) ) { $options = {}; }
	
	var $hour_start = $options.hour_start || 0;
	var $hour_end = $options.hour_end || 24;
	var $minute_start = $options.minute_start || 0;
	var $minute_end = $options.minute_end || 60;
	var $minute_step = $options.minute_step || 1;
	$hour_start = parseInt($hour_start);
	$hour_end = parseInt($hour_end);
	$minute_start = parseInt($minute_start);
	$minute_end = parseInt($minute_end);
	$minute_step = parseInt($minute_step);
	if( $minute_step < 1 || $minute_step > 59 ) { $minute_step = 1; }
	
	
	var $result = new Array();
	var $t_minute_end = 60;
	for( $i=$hour_start; $i<=$hour_end; $i++ )
	{
		if( $i !== $hour_start )
		{
			$minute_start = 0;
		}
		if( $i === $hour_end )
		{
			$t_minute_end = $minute_end;
		}
		for( $j=$minute_start; $j<$t_minute_end; $j+=$minute_step )
		{
			// Alle was größer als 24:00 ist abbrechen!
			if( ($i === 24 && $j > 0) || $i > 24 )
			{
				break;
			}
			$result.push($i.padLeft(2) + ":" + $j.padLeft(2));
		}
	}
	return $result;
}
// Alle Elemente mit der Klasse timecalendar heraussuchen und das Event für den
// realen Zeitkalender anfügen:
addIVENAListener("load", window, function() {
	addIVENAListener("click", document, function($po_event) {
		var $event = $po_event || window.event;
		var $target = getEventTarget($event);
		
		if( hasClass($target, "timecalendar") )
		{
			var $destination_element = getData($target, "timecalendar-element");
			if( "this" === $destination_element ) { $destination_element = $target; }
			timeCalender($event, $target, $destination_element);
		}
	});
});


/**
 * Anhand des Value-Parameters werden alle Elemente mit der Klasse $ps_group
 * disabled oder enabled.
 * 
 * @version 1.0
 * 
 * @param {boolean} $pb_value
 * @param {string} $ps_group
 * @returns -
 */
function group_disable( $pb_value, $ps_group )
{
	var $disabled = $pb_value;
	
	var $elemente = document.getElementsByClassName($ps_group);
	for( var $i=0; $i<$elemente.length; $i++ )
	{
		if( $disabled )
		{
			$elemente[$i].setAttribute("disabled", "disabled");
		}
		else
		{
			$elemente[$i].removeAttribute("disabled");
		}
	}
}

var $manv_infobox = null;
function showMANVInfobox($ps_title, $ps_content_id) {
	if( null !== $manv_infobox )
	{
		windowCloseAction( document.getElementById($manv_infobox) );
		$manv_infobox = null;
  return;
	}

	var $element = document.getElementById($ps_content_id);
	if( $element )
	{
		var $title = $ps_title;
		var $content = $element.innerHTML;
		var $optionen = {
			windowWidth: 350
		};
			
		$manv_infobox = createWindow($title, $content, $optionen);
  BoxAusrichten(jQuery("#container_header div.ivena-messagebox-container"), jQuery("#"+$manv_infobox));
	}
}

/**
 * Animation Framework
 * 
 * @type Array
 */
var $animationFrameworkHalt = false;
var $animationFrameworkTimer = null;
var $animationFramework = new Array();
var $animationFrameworkLength = $animationFramework.length;
var $animationTick = 0;
var $animationTickMilliseconds = 100;
function frameAnimation()
{
	if( true === $animationFrameworkHalt )
	{
		return;
	}
	$animationTick++;
	if( $animationTick > 1000000 )
	{
		$animationTick = 1;
	}
	
	if( $animationTick%10000 === 0 )
	{
		$animationFrameworkHalt = true;
		clearAnimationFrames();
		$animationFrameworkHalt = false;
	}
	
	var $i=0, $retValue=null;
	// Verarbeite alle Animationselemente
	for( $i=0; $i<$animationFrameworkLength; $i++ )
	{
		if( $animationFramework[$i].exit && true === $animationFramework[$i].exit )
		{
			continue;
		}
		if( (($animationTick*$animationTickMilliseconds) % $animationFramework[$i].duration) === 0 )
		{
			if( "function" === typeof($animationFramework[$i].callback) )
			{
				//console.debug("Animation ausführen", $animationTick, $animationFramework[$i]);
				$retValue = $animationFramework[$i].callback( $animationFramework[$i].data );
				if( 1 !== $retValue )
				{
					$animationFramework[$i].exit = true;
				}
			}
		}
	}
}
addIVENAListener("load", window, function() {
	$animationFrameworkTimer = setInterval(function() {
		frameAnimation();
	}, $animationTickMilliseconds);
});

function clearAnimationFrames()
{
	//console.debug("ClearAnimationFrame()");
	clearInterval($animationFrameworkTimer);
	
	$animationFrameworkLength = $animationFramework.length;
	var $tmp_new_frames = new Array();
	for( $i=0; $i<$animationFrameworkLength; $i++ )
	{
		if( $animationFramework[$i].exit && true === $animationFramework[$i].exit )
		{
			continue;
		}
		$tmp_new_frames.push($animationFramework[$i]);
	}
	
	$animationFramework = $tmp_new_frames;
	$animationFrameworkLength = $animationFramework.length;
	
	$animationFrameworkTimer = setInterval(function() {
		frameAnimation();
	}, $animationTickMilliseconds);
}


function addAnimationObject( $pi_duration, $po_data, $po_callback )
{
	var $duration = parseInt($pi_duration);
	if( isNaN($duration) || $animationTickMilliseconds > $duration ) { $duration = 1000; }
	var $data = $po_data;
	if( "object" !== typeof($data) ) { $data = {}; }
	var $callback = $po_callback;
	if( "function" !== typeof($callback) ) { $callback = null; }
	
	var $animationObject = {
		data: $data,
		id: $animationFramework.length,
		duration: $duration,
		callback: $callback
	};
	
	$animationFramework.push($animationObject);
	$animationFrameworkLength = $animationFramework.length;
	
	return $animationFramework.length-1;
}

function removeAnimationObject( $pi_index )
{
	if( "undefined" !== typeof($animationFramework[$pi_index]) )
	{
		$animationFramework[$pi_index].exit = true;
		return true;
	}
	
	return false;
}

/**
 * 
 * 
 * @returns {undefined}
 */
function initBlinkAnimation()
{
	var $elemente = document.getElementsByClassName("blink");
	var $i = 0;
	var $blink_elementid = null,
		$animationObject = null;
	for( $i=0; $i<$elemente.length; $i++ )
	{
		if( "true" !== getData($elemente[$i], "blink-init") )
		{
			$blink_elementid = $elemente[$i].id;
			if( !$blink_elementid || 0 === $blink_elementid.length )
			{
				$blink_elementid = create_uniqid( "blinkAnimation" );
				$elemente[$i].id = $blink_elementid;
			}
			
			addData($elemente[$i], "blink-init", "true");
			addData($elemente[$i], "blink-tick", "0");

			var $blink_duration = parseInt(getData($elemente[$i], "blink-duration"));
			if( $blink_duration < 1 || 100000 < $blink_duration || isNaN($blink_duration) )
			{
				$blink_duration = 1000;
			}

			var $data = {
				element: $elemente[$i],
				element_id: $blink_elementid,
				system_id: $blink_elementid
			};
			addAnimationObject($blink_duration, $data, function( $po_animation_data ) {
				//console.debug( $po_animation_data );
				var $retValue = frameBlinkAnimation( $po_animation_data.system_id, $po_animation_data.element_id );
				return $retValue;
			});
		}
	}
}
addIVENAListener("load", window, function() {
	initBlinkAnimation();
});

/**
 * 
 * 
 * @param {Integer} $pi_systemid
 * @param {String} $ps_elementid
 * @returns {Boolean}
 */
function frameBlinkAnimation( $pi_systemid, $ps_elementid )
{
	var $element = document.getElementById( $ps_elementid );
	if( !$element )
	{
		console.debug("Kein Element");
		return -1;
	}
	
	var $blink_tick = getData($element, "blink-tick") || 0;
	$blink_tick = parseInt($blink_tick);
	if( isNaN($blink_tick) ) { $blink_tick = 0; }
	$blink_tick++;
	if( $blink_tick > 1000000 )
	{
		$blink_tick = 1;
	}
	
	var $blink_pause = getData($element, "blink-pause") || 0;
	$blink_pause = parseInt($blink_pause);
	if( isNaN($blink_pause) ) { $blink_pause = 0; }
	var $blink_resetpause = getData($element, "blink-resetpause") || 0;
	$blink_resetpause = parseInt($blink_resetpause);
	if( isNaN($blink_resetpause) ) { $blink_resetpause = 0; }
	
	
	var $blink_times = getData($element, "blink-times") || -1;
	$blink_times = parseInt($blink_times);
	if( isNaN($blink_times) ) { $blink_times = -1; }
	
	//console.debug("::Blinkanimation", $blink_tick, "Duration:", $blink_tick*100);
	var $retValue = 1;

	//console.debug("-- animation change:", $blink_tick, $blink_pause, $blink_times, $animation);
	var $timer_reduzieren = true;
	if( "hidden" === $element.style.visibility )
	{
		if( $blink_pause > 0 )
		{
			if( $blink_resetpause > 0 )
			{
				$element.style.visibility = "visible";
				$blink_resetpause--;
			}
			else
			{
				$blink_resetpause = $blink_pause;
				$timer_reduzieren = false;
			}
			addData($element, "blink-resetpause", $blink_resetpause);
		}
		else
		{
			$element.style.visibility = "visible";
		}
	}
	else
	{
		$timer_reduzieren = false;
		$element.style.visibility = "hidden";
	}

	if( true === $timer_reduzieren && $blink_times > -1 )
	{
		$blink_times--;
		if( 0 === $blink_times )
		{
			//console.debug("Clear Timer after", $blink_times, "ticks", $ps_elementid);
			$element.style.visibility = "visible";
			$retValue = 2;
		}
		addData($element, "blink-times", $blink_times);
	}
	addData($element, "blink-tick", $blink_tick);
	return $retValue;
}

function open_details( $po_watcher, $ps_destination, $po_sender )
{
	var $watcher = null;
	
	var $linktext_a = $GCS_LOCALE_BTN_ANZEIGEN;
	var $linktext_b = $GCS_LOCALE_BTN_AUSBLENDEN;
	var $linktext_austauschen = false;
	if( $po_sender )
	{
		$linktext_austauschen = ("true" === getData($po_sender, "change-linktext"));
	}
	
	if( "string" === typeof($po_watcher) && 0 < $po_watcher.length )
	{
		$watcher = document.getElementById($po_watcher);
	}
	var $element = document.getElementById($ps_destination);
	
	
	if( null === $watcher )
	{
		toggleClass($element, "hide");
		if( $linktext_austauschen )
		{
			if( hasClass($element, "hide") )
			{
				$po_sender.innerHTML = $linktext_a;
			}
			else
			{
				$po_sender.innerHTML = $linktext_b;
			}
		}
	}
	else
	{
		if( $watcher.checked && true === $watcher.checked )
		{
			removeClass($element, "hide");
			if( $linktext_austauschen )
			{
				$po_sender.innerHTML = $linktext_b;
			}
		}
		else
		{
			addClass($element, "hide");
			if( $linktext_austauschen )
			{
				$po_sender.innerHTML = $linktext_a;
			}
		}
	}
}

function toggle_abschnitt( $ps_id, $po_sender )
{
	toggleClass($ps_id, "hide");
	
	if( hasClass($ps_id, "hide") )
	{
		$po_sender.innerHTML = $GCS_LOCALE_BTN_ANZEIGEN;
	}
	else
	{
		$po_sender.innerHTML = $GCS_LOCALE_BTN_AUSBLENDEN;
	}
}

function disabledEventPropagation(event)
{
 if (event.stopPropagation){
  event.stopPropagation();
 } else if(window.event){
  window.event.cancelBubble=true;
 }
}


function getHTMLFieldValue( $ps_name )
{
	var $element = null;
	var $ergebnis = null;
	if( document.getElementById($ps_name) )
	{
		$element = new Array(document.getElementById($ps_name));
	}
	else if( document.getElementsByName($ps_name) )
	{
		$element = document.getElementsByName($ps_name);
	}
	
	for( i=0; i<$element.length; i++ )
	{
		// Radio-Buttons
		if( "INPUT" === $element[i].tagName && "radio" === $element[i].type )
		{
			if( true === $element[i].checked )
			{
				$ergebnis = $element[i].value;
			}
		}
		else if( "INPUT" === $element[i].tagName && "checkbox" === $element[i].type )
		{
			if( true === $element[i].checked )
			{
				$ergebnis = $element[i].value;
			}
		}
		else if( "SELECT" === $element[i].tagName )
		{
			$ergebnis = $element[i].options[$element[i].selectedIndex].value;
		}
	}

	return $ergebnis;
}

var $GCR_WINDOW_HILFE = null;
function zeige_hilfe( $ps_fieldname )
{
	$GCR_WINDOW_HILFE = window.open("remote.php?si=" + $IVENA_SI + "&format=html&view=hilfe&aktion=" + escape($ps_fieldname), $GCS_LOCALE_WINDOW_HILFE_TITLE, "directories=no,height=300,width=400,location=no,menubar=no,toolbar=no,scrollbars=yes");
}

/**
 * Püft eine Telefonnummer auf internationale Gültigkeit.
 * Berücksichtigt werden bisher alle europäischen Länder!
 * 
 * @version 1.0
 * 
 * @param {string} $ps_text
 * @returns {Boolean}
 */
function isValidInternationalNumber( $ps_text )
{
	var $ergebnis = false;
	if( "string" === typeof($ps_text) )
	{
		var $phoneRegEx = /\+([0-9]+)\s+([1-9][0-9]+)/;
		if( $ps_text.match($phoneRegEx) )
		{
			$ergebnis = true;
		}
	}
	
	return $ergebnis;
}

/**
 * Gibt zurück ob eine EMail-Adresse gültig ist.
 * 
 * @version 1.0
 * 
 * @param {string} $ps_text
 * @returns {Boolean}
 */
function isValidEMail( $ps_text )
{
	var $ergebnis = false;
	if( "string" === typeof($ps_text) )
	{
		var $phoneRegEx = /^[^@]+@[^@]{2,}\.[a-z0-9-]{2,}$/i;
		if( $ps_text.match($phoneRegEx) )
		{
			$ergebnis = true;
		}
	}
	
	return $ergebnis;
}

/*
 * Liest die aktuelle Cursorposition in einem Feld
 */
function getCursorPosition(input_element)
{
 if(input_element)
 {
  if(document.selection) // IE
  {
   input_element.focus();
   var sel = document.selection.createRange();
   var selLen = document.selection.createRange().text.length;
   sel.moveStart('character', -input_element.value.length);
   return sel.text.length - selLen;
  }
  else
  {
   return input_element.selectionStart;
  }
 }
 return false;
}

/*
 * setzt den Cursor auf eine bestimmte Stelle
 * Cross Browser
 */
function setzeCursorPosition(input_element, position, position_ende)
{
  if(isNaN(position))
  {
    return false;
  }
  if(!position_ende)
  {
    position_ende = position;
  }
  
  if(input_element)
  {
    if(document.selection)
    {
      input_element.focus();
      var oSel = document.selection.createRange();
      if(position == input_element.value.length)
      {
        oSel.moveStart('character', 0);
        oSel.moveEnd('character', 0);
      }
      else
      {
       oSel.moveStart('character', -(input_element.value.length-position));
       oSel.moveEnd('character', -(input_element.value.length-position_ende));
      }
      oSel.select();
    }
    else if(input_element.setSelectionRange)
    {
      input_element.setSelectionRange(position,position_ende);
      return true;
    }
    return false;
  }
  else
  {
    return false;
  }  
}

/**
 * AJAX-Objekt
 * 
 * sendRequest: function( $ps_url: string, $po_callbacks, $ps_method: [GET, POST], $pm_data: object, $ps_result_encoding: [html, json], $pb_async: boolean )
 */
var AJAX = {
	requests: new Array(),
	/**
	 * Erstellt ein AJAX-Request-Objekt zur Verwendung.
	 * 
	 * @version 1.0.0
	 * 
	 * @returns {ActiveXObject|XMLHttpRequest}
	 */
	createRequest: function() {
		if (typeof XMLHttpRequest !== 'undefined') {
			return new XMLHttpRequest();
		}
		var versions = [
			"MSXML2.XmlHttp.6.0",
			"MSXML2.XmlHttp.5.0",
			"MSXML2.XmlHttp.4.0",
			"MSXML2.XmlHttp.3.0",
			"MSXML2.XmlHttp.2.0",
			"Microsoft.XmlHttp"
		];

		var xhr;
		for (var i = 0; i < versions.length; i++) {
			try {
				xhr = new ActiveXObject(versions[i]);
				break;
			} catch (e) {
			}
		}
		return xhr;
	},
	
	/**
	 * Allgemeine Funktion zum Senden eines AJAX-Requests.
	 * 
	 * $po_callbacks:
	 * - beforeInit( $pm_data, tmpData )
	 * - connectionInit( $pm_data, tmpData )
	 * - requestReceived( $pm_data, tmpData )
	 * - processingRequest( $pm_data, tmpData )
	 * - requestWillFinished( responseData, $pm_data, tmpData )
	 * - requestFinished( responseData, $pm_data, tmpData )
	 * - success( responseData, $pm_data, tmpData )
	 * - error( responseData, $pm_data, tmpData )
	 * - requestDidFinished( responseData, $pm_data, tmpData )
	 * - aborted( $pm_data, tmpData )
	 * - timedOut( $pm_data, tmpData )
	 * 
	 * @version 1.0.0
	 * 
	 * @param {string} $ps_url
	 * @param {object} $po_callbacks
	 * @param {string} $ps_method
	 * @param {object} $pm_data
	 * @param {string} $ps_result_encoding
	 * @param {boolean} $pb_async
	 * @returns {ActiveXObject|XMLHttpRequest|AJAX.sendRequest.tmpRequest}
	 */
	sendRequest: function( $ps_url, $po_callbacks, $ps_method, $pm_data, $ps_result_encoding, $pb_async ) {
		if ($pb_async === undefined) {
			$pb_async = true;
		}
		
		if( "POST" !== $ps_method )
		{
			$ps_method = "GET";
		}
		
		$result_encoding = "html";
		if( "json" === $ps_result_encoding )
		{
			$result_encoding = $ps_result_encoding;
		}
		
		var tmpData = {
			xhr: tmpRequest,
			async: $pb_async,
			method: $ps_method,
			url: $ps_url,
			resultEncoding: $result_encoding,
			httpStatus: -1,
			httpStatusText: ""
		};
		
		var tmpRequest = AJAX.createRequest();
		if( $po_callbacks && "function" === typeof($po_callbacks.aborted) )
		{
			tmpRequest.onabort = function()
			{
				$po_callbacks.aborted( $pm_data, tmpData );
			};
		}
		if( $po_callbacks && "function" === typeof($po_callbacks.timedOut) )
		{
			tmpRequest.ontimeout = function()
			{
				$po_callbacks.timedOut( $pm_data, tmpData );
			};
		}
		tmpRequest.open($ps_method, $ps_url, $pb_async);
		tmpRequest.onreadystatechange = function () {
			switch( tmpRequest.readyState )
			{
				case 0:
					if( $po_callbacks && "function" === typeof($po_callbacks.beforeInit) )
					{
						$po_callbacks.beforeInit( $pm_data, tmpData );
					}
					break;
				case 1:
					if( $po_callbacks && "function" === typeof($po_callbacks.connectionInit) )
					{
						$po_callbacks.connectionInit( $pm_data, tmpData );
					}
					break;
				case 2:
					if( $po_callbacks && "function" === typeof($po_callbacks.requestReceived) )
					{
						$po_callbacks.requestReceived( $pm_data, tmpData );
					}
					break;
				case 3:
					if( $po_callbacks && "function" === typeof($po_callbacks.processingRequest) )
					{
						$po_callbacks.processingRequest( $pm_data, tmpData );
					}
					break;
				case 4:
					if( 0 !== tmpRequest.status )
					{
						var responseData = tmpRequest.responseText;
						if( "json" === tmpData.resultEncoding && "object" !== typeof(responseData) )
						{
							responseData = ( typeof(JSON) !== 'undefined' ? JSON.parse(responseData) : eval("(" + responseData + ")") );
						}
						tmpData.httpStatus = tmpRequest.status;
						tmpData.httpStatusText = tmpRequest.statusText;

						if( $po_callbacks && "function" === typeof($po_callbacks.requestWillFinished) )
						{
							$po_callbacks.requestWillFinished( responseData, $pm_data, tmpData );
						}

						if( $po_callbacks && "function" === typeof($po_callbacks.requestFinished) )
						{
							$po_callbacks.requestFinished( responseData, $pm_data, tmpData );
						}
						else
						{
							// HTTP Status 200: OK
							if( tmpRequest.status === 200 )
							{
								if( $po_callbacks && "function" === typeof($po_callbacks.success) )
								{
									$po_callbacks.success( responseData, $pm_data, tmpData );
								}
							}
							else
							{
								if( $po_callbacks && "function" === typeof($po_callbacks.error) )
								{
									$po_callbacks.error( responseData, $pm_data, tmpData );
								}
							}
						}

						if( $po_callbacks && "function" === typeof($po_callbacks.requestDidFinished) )
						{
							$po_callbacks.requestDidFinished( responseData, $pm_data, tmpData );
						}
					}
					break;
				default:
			}
		};
		if ($ps_method === "POST") {
			tmpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
		tmpRequest.setRequestHeader("X-Requested-With", "IVENA eHealth JavaScript Engine, v1.0.0");
		tmpRequest.send($pm_data);
		
		AJAX.requests.push(tmpRequest);
		
		return tmpRequest;
	},
	
	
	/**
	 * Sendet eine normale GET-Anfrage an den Server.
	 * 
	 * $po_callbacks:
	 * - beforeInit( $pm_data, tmpData )
	 * - connectionInit( $pm_data, tmpData )
	 * - requestReceived( $pm_data, tmpData )
	 * - processingRequest( $pm_data, tmpData )
	 * - requestWillFinished( responseData, $pm_data, tmpData )
	 * - requestFinished( responseData, $pm_data, tmpData )
	 * - success( responseData, $pm_data, tmpData )
	 * - error( responseData, $pm_data, tmpData )
	 * - requestDidFinished( responseData, $pm_data, tmpData )
	 * - aborted( $pm_data, tmpData )
	 * - timedOut( $pm_data, tmpData )
	 * 
	 * @version 1.0.0
	 * 
	 * @param {string} $ps_url
	 * @param {object} $po_data
	 * @param {object} $po_callbacks
	 * @param {string} $ps_result_encoding
	 * @returns {ActiveXObject|XMLHttpRequest|AJAX.sendRequest.tmpRequest}
	 */
	load: function( $ps_url, $po_data, $po_callbacks, $ps_result_encoding ) {
		if( "function" === typeof($po_callbacks) )
		{
			$po_callbacks = {
				success: $po_callbacks
			};
		}
		
		var query = [];
		for (var key in $po_data) {
			query.push(encodeURIComponent(key) + '=' + encodeURIComponent($po_data[key]));
		}
		return AJAX.sendRequest($ps_url + (query.length ? '?' + query.join('&') : ''), $po_callbacks, "GET", null, $ps_result_encoding, true);
	},
	
	
	/**
	 * Sendet via POST Daten an den Server.
	 * 
	 * $po_callbacks:
	 * - beforeInit( $pm_data, tmpData )
	 * - connectionInit( $pm_data, tmpData )
	 * - requestReceived( $pm_data, tmpData )
	 * - processingRequest( $pm_data, tmpData )
	 * - requestWillFinished( responseData, $pm_data, tmpData )
	 * - requestFinished( responseData, $pm_data, tmpData )
	 * - success( responseData, $pm_data, tmpData )
	 * - error( responseData, $pm_data, tmpData )
	 * - requestDidFinished( responseData, $pm_data, tmpData )
	 * - aborted( $pm_data, tmpData )
	 * - timedOut( $pm_data, tmpData )
	 * 
	 * @version 1.0.0
	 * 
	 * @param {string} $ps_url
	 * @param {object} $po_data
	 * @param {object} $po_callbacks
	 * @param {string} $ps_result_encoding
	 * @returns {return xhr}
	 */
	post: function( $ps_url, $po_data, $po_callbacks, $ps_result_encoding ) {
		if( "function" === typeof($po_callbacks) )
		{
			$po_callbacks = {
				success: $po_callbacks
			};
		}
		
		var query = [];
		for (var key in $po_data) {
			query.push(encodeURIComponent(key) + '=' + encodeURIComponent($po_data[key]));
		}
		return AJAX.sendRequest($ps_url, $po_callbacks, "POST", query.join('&'), $ps_result_encoding, true);
	}
};



/**
 * Erzeugt Meldungen aus einer Standard-AJAX-Antwort von IVENA.
 * 
 * Spezielle Optionen im Objekt '$callback_context':
 * - show_error_numbers: bool
 *   Wenn nicht gesetzt ODER true, dann werden die Fehlernummern mit ausgegeben
 *   bei einer Meldung, sofern vorhanden.
 * - show_error_trace: bool
 *   Wenn diese Eigenschaft im Objekt vorhanden und auf 'true' gesetzt ist, dann
 *   werden aus der Antwort ggf. weitere Informationen dargestellt. Diese können
 *   wertvoll in der Entwicklung sein, um (Abbruch-)Bedingungen schneller zu
 *   erkennen. In einem Echtsystem sollte dieser Schalter, rein aus optischen
 *   Gründen, deaktiviert sein!
 * 
 * @version 1.0.0
 * @param {object|Array} $errors
 * @param {undefined|function} $callback_method
 * @param {undefined|object} $callback_context
 * @returns {undefined}
 */
function processErrorResponseObject( $errors, $callback_method, $callback_context )
{
	if( "object" !== typeof($errors) )
	{
		return;
	}

	var $error = null;
	var $type = "confirm";
	if( "function" !== typeof($callback_method) )
	{
		$type = "alert";
	}
	if( "object" !== typeof($callback_context) )
	{
		$callback_context = {};
	}
	var $str = "";
	var $clue = "";
	
	// Es sind 2 Fehler aufgetreten:
	// -> 
	var $Meldungen = {
		fehler: new Array(),
		warnungen: new Array(),
		sonstiges: new Array()
	};
	var $error_type = "";
	for( var $key in $errors )
	{
		$error = $errors[$key];
		
		if( "error" === $error.err_type )
		{
			$Meldungen.fehler.push( $error );
			$type = "alert";
		}
		else if( "warning" === $error.err_type )
		{
			$Meldungen.warnungen.push( $error );
		}
		else
		{
			$Meldungen.sonstiges.push( $error );
		}
	}
	
	var $ListeMeldungen = null;
	for( var $meldungType in $Meldungen )
	{
		$ListeMeldungen = $Meldungen[$meldungType];
		// console.log("Alle Meldungen:", $meldungType, $ListeMeldungen);
	
		// Überschrift erstellen:
		if( 0 < $ListeMeldungen.length )
		{
			$str += $clue;
			$str += $clue;
			if( "fehler" === $meldungType )
			{
				$str += $GCS_LOCALE_AJAX_ERROR_RESPONSE_FEHLER.replace(/%Anzahl%/, $ListeMeldungen.length);
			}
			else if( "warnungen" === $meldungType )
			{
				$str += $GCS_LOCALE_AJAX_ERROR_RESPONSE_WARNUNGEN.replace(/%Anzahl%/, $ListeMeldungen.length);
			}
			else
			{
				$str += $GCS_LOCALE_AJAX_ERROR_RESPONSE_SONSTIGES.replace(/%Anzahl%/, $ListeMeldungen.length);
			}
			$clue = "\n";
		}
		for( var $key in $ListeMeldungen )
		{
			$error = $ListeMeldungen[$key];
			
			// Verarbeitung
			$str += $clue;
			$str += "- ";
			$str += $error.err_msg;
			if( "undefined" === typeof($callback_context.show_error_numbers)
			 || true === $callback_context.show_error_numbers
				)
			{
				if( 0 !== $error.err_no )
				{
					$str += " (#" + $error.err_no + ")";
				}
			}
			if( "undefined" !== typeof($callback_context.show_error_trace)
			 && true === $callback_context.show_error_trace
				)
			{
				if( "string" === typeof($error.err_file) )
				{
					$str += "\n=> File: " + $error.err_file + ", Line: " + $error.err_line;
				}
			}
			$clue = "\n\n";
		}
	}
	$str = trim($str);
	
	if( "alert" === $type )
	{
		alert($str);
	}
	else if( "confirm" === $type )
	{
		if( confirm($str) )
		{
			$callback_method.call( $callback_context, true );
		}
		else
		{
			$callback_method.call( $callback_context, false );
		}
	}
}

function padLeft(num, size)
{
	num = num.toString();
	while (num.length < size) { num = "0" + num; }
	return num;
}


/**
 * Verarbeitet die Rückgabe einer IVENA-AJAX-Antwort und liefert ggf. die Fehler
 * zurück.
 * 
 * @version 1.0.0
 * @param {object} $Response
 * @param {string} $DestinationSelektor
 * @param {object} $Options
 * @returns {Boolean}
 */
function showAJAXErrors( $Response, $DestinationSelektor, $Options )
{
	$Options = $Options || {};
	if( "object" !== typeof($Options) ) { $Options = {}; }
	
	var $Type = "text";
	var $Destination = jQuery($DestinationSelektor);
	if( 0 < $Destination.length )
	{
		$Type = "html";
	}

	var $str = createAJAXErrorString($Response, $Type);
	var $result = 0 < $str.length;
	
	if( $result && "text" === $Type )
	{
		alert($str);
	}
	else if( "html" === $Type )
	{
		$Destination.html($str);
	}
	return $result;
}

/**
 * Erstellt aus der AJAX-Antwort einen Fehlertext, sofern die entsprechenden
 * Elemente vorhanden sind.
 * 
 * @version 1.0.0
 * @param {object} $Response
 * @param {string} $Type 'html'/''
 * @returns {String}
 */
function createAJAXErrorString( $Response, $Type )
{
	var $ErrorList = $Response.errors || null;
	var $result = "";
	if( Array.isArray($ErrorList) && 0 < $ErrorList.length )
	{
		var $Error = null;
		for( var $key in $ErrorList )
		{
			$Error = $ErrorList[$key];
			
			if( "html" === $Type )
			{
				if( "string" === typeof($Error.err_html) )
				{
					$result += $Error.err_html;
				}
				else
				{
					// $Error.err_type
					$result += "<div class=\"alert bg-danger\">";
					$result += $Error.err_msg;
					$result += " (#";
					$result += $Error.err_no;
					$result += ")";
					if( "string" === typeof($Error.err_file) )
					{
						$result += "<br />";
						$result += "(";
						$result += $Error.err_file;
						$result += "@L:";
						$result += $Error.err_line;
						$result += ")";
					}
					$result += "</div>";
				}
			}
			else
			{
				$result += $Error.err_msg;
				$result += " (#";
				$result += $Error.err_no;
				$result += ")";
				$result += "\n";
			}
		}
	}
	else if( 0 < $Response.errno )
	{
		$result += $Response.error;
		$result += " (#";
		$result += $Response.errno;
		$result += ")";
	}
	$result = $result.trim();
	return $result;
}


/**
 * Prüft den AJAX-Call und führt ggf. ein Abort durch, wenn die Zeit zu lange 
 * her ist. Falls es eine Doppelausführung per Definition ist, liefert diese
 * Funktion automatisch FALSE zurück.
 * Optionen:
 * - delta: int (in Sekunden, Standard: 5)
 *   Angabe wie viel Zeit zwischen zwei Requests vergehen darf, bevor es NICHT
 *   mehr als Doppelausführung gilt.
 * - force: bool (Standard: false)
 *   Deaktiviert die Prüfung auf Doppelausführung.
 * 
 * @version 1.0.0
 * @param {string} $key
 * @param {object} $options
 * @returns {Boolean}
 */
function checkAJAXRestart( $key, $Options )
{
	$Options = $Options || {};
	var $Delta = parseInt( $Options.delta || 5 );
	if( isNaN($Delta) ) { $Delta = 5; }
	var $Force = !!( $Options.force || false );
	var $Timestamp = Math.round(new Date().getTime()/1000);
	
	if( "object" !== typeof($AJAXCALLS[$key]) )
	{
		$AJAXCALLS[$key] = {
			jqXHR: null,
			timestamp: -1
		};
	}
	
	// console.log("AJAX Ausführung prüfen[", $key,"]: TS=", $Timestamp, ", bisheriger TS=", $AJAXCALLS[$key].timestamp, ", Doppelausführung: ", $Timestamp <= ($AJAXCALLS[$key].timestamp+$Delta));
	if( null !== $AJAXCALLS[$key].jqXHR )
	{
		if( !$Force && $Timestamp <= ($AJAXCALLS[$key].timestamp+$Delta) )
		{
			return false;
		}
		
		$AJAXCALLS[$key].jqXHR.abort();
	}
	else
	{
		$AJAXCALLS[$key].timestamp = $Timestamp;
	}
	return true;
}


/**
 * Erstellt eine ShowMessage-Box.
 * 
 * @version 1.0.0
 * @param {type} $str
 * @param {type} $type
 * @returns {String}
 */
function ShowMessage( $str, $type )
{
	var $result = "<div class=\"messagebox-container status-" + $type + "\">";
		$result += "<div class=\"messagebox\">";
			$result += $str;
		$result += "</div>";
	$result += "</div>";
	return $result;
}

/**
 * Um die Programmausführung für einen kurzen moment zu pausieren.
 * Anwendung wie folgt:
 * - await Sleep(1000);
 * - Die Funktion selbst muss den Kopf 'async function XYZ' besitzen!
 * 
 * @version 1.0.0
 * @param {integer} milliseconds
 * @returns {Promise}
 */
function Sleep(milliseconds)
{
 return new Promise(function (resolve) {
    return setTimeout(resolve, milliseconds);
  });
}

/**
 * Fügt allen entsprechend markierten Schaltern und Elementen mit der CSS-Klasse
 * 'btnDelayed' eine automatische Deaktivierung von drei Sekunden bei Klick hinzu.
 * Das Element wird IMMER nach dieser Zeit wieder freigegeben!
 * 
 * @version 1.0.0
 * @returns {void}
 */
function attachButtonDelayed()
{
	let $Elemente = document.getElementsByClassName("btnDelayed");
	let $Element = null;
	for( let $Index = 0; $Index < $Elemente.length; $Index++ )
	{
		try
		{
			$Element = $Elemente[$Index];
			if( $Element.classList.contains("btnDlayedInit") )
			{
				continue;
			}

			$Element.classList.add("btnDlayedInit");
			$Element.addEventListener("click", function() {
				setTimeout(function() {
					$Element.setAttribute("disabled", true);
				}, 10);
				setTimeout(function() {
					$Element.removeAttribute("disabled");
					return true;
				}, 3000);
				return true;
			});
		}
		catch( $Exception )
		{
			// Fehlercode
		}
	}
}


addEventListener("load", function() {
	attachButtonDelayed();
});
