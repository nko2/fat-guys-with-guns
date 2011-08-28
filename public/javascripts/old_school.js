$(document).ready(function() {
    var html_array = $(".printable").text().split("");
    console.warn(html_array);
    var index = 0;

    $(".printable").html("");
    setTimeout(stepLetter, 10);

    function stepLetter() {
        var text_array = html_array.slice(0, index);
        var html = text_array.join("").replace(/\^/g,"<br><br>").replace(/\~/g,"<br>");

        $(".printable").html("");
        $(".printable").html(html);
        index = index + 1;
        if (index < html_array.length)
            setTimeout(stepLetter, 20);
    }

});