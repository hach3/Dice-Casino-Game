$(window).on('load', function(){
  var urlProvablyFair = "https://nebuchadnezzar.dev/game/details/";
  var rtp = 99;
  var total_bet = 0;
  var total_win = 0;

  initRTP();

  /* EVENTS NUMBER MODIFICATION */
  $('#range-number').mousemove(function(){
      updateStatistics("range-number");
  });

  $('#roll-high').on('change paste input', function(){
      updateStatistics("roll-high");
  });

  $('#amount-bet').on('change paste input', function(){
      updateStatistics("amount-bet");
  });
  $('#chances').on('change paste input', function(){
      updateStatistics("chances");
  });
  $('#multiplier').on('change paste input', function(){
      updateStatistics("multiplier");
  });

  /* EVENT SUBMIT GAME */
  $(".controls form").submit(function(){
    var gameVerified = verifyInput();
    if(gameVerified === false) return false;
    postGame(gameVerified)
    return false;
  });

  function updateStatistics(_trigger) {
    var multiplier = 0;
    var chances = 0;
    var benefits = 0;
    var betAmount = parseFloat($('#amount-bet').val());
    var rollHigh = 0;

    switch(_trigger) {
      case "range-number":
        rollHigh = parseFloat($('#range-number').val());
        
        chances = 100 - rollHigh;
        multiplier = 1 / (chances/rtp);
        benefits = betAmount * multiplier - betAmount;
        
        $('#roll-high').val(rollHigh.toFixed(4));
      break;
      case "roll-high":
        rollHigh = parseFloat($('#roll-high').val());

        chances = 100 - rollHigh;
        multiplier = 1 / (chances/rtp);
        benefits = betAmount * multiplier - betAmount;

        $('#range-number').val(rollHigh.toFixed(4));
      break;
      case "multiplier": 
        multiplier = parseFloat($('#multiplier').val());
        
        rollHigh = 100 - (rtp * (1/multiplier));

        benefits = betAmount * multiplier - betAmount;
        chances = 100 - rollHigh;
        $('#roll-high').val(rollHigh.toFixed(4));
        $('#range-number').val(rollHigh.toFixed(4));
      break;
      case "chances":
        chances = parseFloat($('#chances').val());
        rollHigh = 100 - chances;
        multiplier = 1 / (chances/rtp);
        benefits = betAmount * multiplier - betAmount;
        $('#roll-high').val(rollHigh.toFixed(4));
        $('#range-number').val(rollHigh.toFixed(4));
      break;
      default:
        rollHigh = parseFloat($('#range-number').val());
        chances = 100 - rollHigh;
        multiplier = 1 / (chances/rtp);
        benefits = (betAmount * multiplier - betAmount);
        
        $('#roll-high').val(rollHigh.toFixed(4));
        $('#range-number').val(rollHigh.toFixed(4));
      break;
    }  

    $('#multiplier').val(multiplier.toFixed(4));
    $('#amount-profit').val(benefits.toFixed(4));
    $('#chances').val(chances.toFixed(4));  
  }

  function initRTP() {
    $.ajax({
      type: "GET",
      url: "/rtp",
      success: function(data) {
        rtp = data.rtp;
        updateStatistics("range-number");
      },
      error: function(err) {
        console.log('ERR', err);
      },
    });
  }

  function postGame(game) {
    $.ajax({
      type: "POST",
      url: "/play",
      data: {          
        "number": game.rollHigh,
        "bet": game.betAmount
      },
      success: function(data) {
        total_bet += parseFloat(data.result.bet);
        
        var won = "red";
        var sign = "";
        var multi = "";
        
        if(data.result.won) {
          won = "green";
          sign = "+";
          multi = " x" + parseFloat(data.result.multi).toFixed(2);
          total_win += parseFloat(data.result.bet) * parseFloat(data.result.multi)
        }
        var randNumber = data.result.number_random;

        var li = '';
        li += '<li>';
        li += ' <a class="' + won + '" href="' + data.url + '" target="_blank">';
        li += '   Rand : ' + randNumber + '  ';
        li +=     sign + data.result.profit.toFixed(2);
        li +=     multi;
        li += ' </a>';
        li += '</li>';
        
        $('#results').prepend(li);
        $('#total-results').text('Bet : ' + total_bet + '. Won : ' + total_win);
      },
      error: function(err) {
        console.log('ERR', err);
      },
    });
  }
  
  function verifyInput() {
    var betAmount = $('#amount-bet').val();
    if(betAmount == null || betAmount == '') {
      alert('Invalid bet amount');
      return false;
    }
    betAmount = parseFloat(betAmount);
    if(betAmount <= 0) {
      alert('Invalid bet amount');
      return false;
    }

    var rollHigh = $('#roll-high').val();
    if(rollHigh == null || rollHigh == '') {
      alert('Invalid % amount');
      return false;
    }
    rollHigh = parseFloat(rollHigh);
    if(rollHigh < 2 || rollHigh > 98) {
      alert('Invalid % amount');
      return false;
    }
    return {rollHigh, betAmount};
  }
  
});
