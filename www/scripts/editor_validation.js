var _validation_disabled = false;

function validate_success() {
  $("#validation_status").text("Löglegt XML");
  $("#validation_status").css('color', 'green');
  $("#validation_error").css('display', 'none');
}

function validate_failure(result) {
  $("#validation_status").text("XML Villa!");
  $("#validation_status").css('color', 'red');
  $("#validation_error").css('display', 'block');
  $("#validation_message").text(result);
}


// Validation code taken from W3schools on XML validation
var xt="",h3OK=1
function checkErrorXML(x) {
  xt=""
  h3OK=1
  checkXML(x)
}

function checkXML(n) {
  var l,i,nam
  nam=n.nodeName
  if (nam=="h3") {
    if (h3OK==0) {
      return;
    }
    h3OK=0
  }
  if (nam=="#text") {
    xt=xt + n.nodeValue + "\n"
  }
  l=n.childNodes.length
  for (i=0;i<l;i++) {
    checkXML(n.childNodes[i])
  }
}

function validateXML_W3() {
  // code for IE
  if (window.ActiveXObject) {
    var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async=false;
    xmlDoc.loadXML(editor.getValue());
    if(xmlDoc.parseError.errorCode!=0) {
      txt="Error Code: " + xmlDoc.parseError.errorCode + "\n";
      txt=txt+"Error Reason: " + xmlDoc.parseError.reason;
      txt=txt+"Error Line: " + xmlDoc.parseError.line;
      alert(txt);
    } else {
      //console.log("for some reason we already validated, and there were no errors!");
      return "OK";
    }
    // code for Mozilla, Firefox, Opera, etc.
  } else if (document.implementation.createDocument) {
    try {
      var text=editor.getValue();
      var parser=new DOMParser();
      var xmlDoc=parser.parseFromString(text,"application/xml");
    } catch(err) {
      console.log("err:", err.message);
      alert(err.message);
      return "Exception: " + err.message;
    }

    if (xmlDoc.getElementsByTagName("parsererror").length>0) {
      checkErrorXML(xmlDoc.getElementsByTagName("parsererror")[0]);
      console.log(xt)
      return xt;
    } else {
      //console.log("for some reason we already validated, and there were no errors!");
      return "OK";
    }
  } else {
    alert('Your browser cannot handle XML validation');
  }
  return false;
}

function autovalidator() {

  if (_validation_disabled) {
    status_container = $("#validation_status");
    status_container.text("Slökkt er á tæknilegri villuleitun");
    status_container.css('color', 'orangered');
    $("#validation_error").css('display', 'none');
    return;
  }
  var tags = parse_tags(); // from editor_tools.js
  if (validate_schema(tags)) {
    /* schema validation failed, don't do any other validation */
    return;
  }
  result = validateXML_W3();
  //console.log("validation returned", result);
  if (result == "OK") {
    validate_success();
  } else {
    console.log(result, "is not", "OK");
    validate_failure(result);
  }
}

// Returns true if an error is found
function validate_schema(tags) {
  function is_tag_ok(tag_label) {
    var meta_char = tag_label[0]
    if (meta_char == '?' || meta_char == '!') {
      // It's a meta tag or a comment, we will allow it
      return true;
    }
    var slash_index = tag_label.indexOf('/')
    if (slash_index > 0) {
      tag_label = tag_label.substr(0, slash_index);
    }
    var found = schema_tags[tag_label];
    if (!found) {
      return false;
    }
    return true;
  }

  function handle_tag_not_found(tag) {
    console.log("a tag:", tag);
    validate_failure("Óþekkt tag: " + tag.tag_label + " í línu " + tag.line + 1);
  }

  // assumes a schema_tags variable
  if (!schema_tags) {
    console.log("Cannot validate schema without schema_tags variable!");
    return;
  }

  // first prototype: just validate that tags are legal
  for (var i = 0; i < tags.length; ++i) {
    // check the opening tag, 
    // if the opening tags are OK
    // then bad closing tags will not match
    var tag = tags[i].tag_open
    var label = tag.tag_label;
    if (!is_tag_ok(label)) {
      handle_tag_not_found(tag);
      return true;
    }
  }
}