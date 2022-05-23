class DateHelper {
    formatDate(date) {
        let newDate = date.replace( /(\d{2}\/\d{2}\/)(\d{4})$/, '$1$2' );

        if (newDate.length < 7) {
            newDate = newDate.replace( /(\d{2})(\d)/, '$1/$2' );
        }

        return newDate;        
    }
    
    formatDateTime(dateTime) {
        // Format Date
        let newDateTime = dateTime.replace( /(\d{2}\/\d{2}\/)(\d{4})$/, '$1$2' );

        if (newDateTime.length < 7) {
            newDateTime = newDateTime.replace( /(\d{2})(\d)/, '$1/$2' );
        }
        
        // Format Time
        newDateTime = newDateTime.replace( /(\d{4})(\d)/, '$1 $2' );                
        newDateTime = newDateTime.replace( /(\d{4}\s\d{2})(\d)/, '$1:$2' );        
        newDateTime = newDateTime.replace( /(\d{4}\s\d{2})(\d{2})$/, '$1$2' );
        newDateTime = newDateTime.replace( /(\d{2}:\d{2})(\d)/, '$1' );

        return newDateTime;        
    }
}

export default new DateHelper();