<?php
class dashboard {
  protected $conn;
  public function __construct(){ 
    $ip = "192.168.1.203"; 
    $con = array("us"=>"dmt036", "pw"=>"sdtsdt", "db"=>"sdtprod");
    $host = $ip. ":1521/" .$con['db'];    
    $this->conn = oci_connect($con['us'], $con['pw'], $host, 'AL32UTF8');
  }

  public function scheduleData(){
    $sql = "SELECT 
    vdb_type,
    vdb_nbr,
    vdb_comp,
    TO_CHAR(vdb_date, 'HH24.MI') AS display_time,
    vdb_effdate,
    vdb_driver,
    vdb_car,
    vdb_item,
    vdb_qty,
    vdb_um,
    vdb_status,
    vdb_rmks,
    vdb_user,
    vdb_chr01,
    vdb_chr02,
    vdb_chr03,
    vdb_num01,
    vdb_num02,
    vdb_num03,
    vdb_date01,
    vdb_date02,
    vdb_date03
    FROM 
        vdb_det 
    WHERE 
        TO_DATE(vdb_effdate, 'dd/mm/rr') = TO_DATE(SYSDATE, 'dd/mm/rr') 
    ORDER BY 
    TO_CHAR(vdb_date, 'HH24:MI'), vdb_nbr "; // Removed the semicolon here

    $objParse = oci_parse($this->conn, $sql);
    oci_execute($objParse, OCI_DEFAULT);
    $result = array();
    while ($row = oci_fetch_assoc($objParse)) {
        $result[] = $row;
    }
    oci_free_statement($objParse);
    return $result;
}

  public function setTime(){
    $sql = "SELECT WOC_VD_IN, WOC_VD_OUT FROM WOC_CTRL";
    $objParse = oci_parse($this->conn, $sql);
    oci_execute($objParse, OCI_DEFAULT);
    $result;
    while ($row = oci_fetch_assoc($objParse)) {
        $result = (object) $row;
    }
    oci_free_statement($objParse);
    return $result;
  }
}
?>