contract Bet is usingOraclize {
  bool public is_featured;
  string public title;
  string public description;
  string public category;
  string url_oraclize;

  uint8 winner_idx;
  
  event new_betting(uint8 for_team_idx, address from, amount);

  function __callback(bytes32 myid, string result) {
    if (msg.sender != oraclize_cbAddress()) throw;
      viewsCount = result;
      newYoutubeViewsCount(viewsCount);
  }

  function update_result() payable {
    oraclize_query('URL', url_oraclize);
  }
  
  function toggle_featured() {
    if (msg.sender != ebets_address()) throw;
    is_featured = !is_featured;
  }
  
  function bet(uint8 for_team_idx) {
    new_betting(for_team_idx, msg.sender, msg.value);
  }

  function collect_profit() {

  }
  
  //If the oracle fails or is not able to get the right answer
  function resolve_conflict(uint8 for_team_idx) {
  }
}
