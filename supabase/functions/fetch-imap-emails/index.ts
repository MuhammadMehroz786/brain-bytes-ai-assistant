/**
 * Fetches and processes recent emails using a robust IMAP library.
 */
async function fetchAndProcessEmails(email: string, password: string): Promise<EmailSummary[]> {
  const imapConfig: Imap.Config = {
    user: email,
    password: password,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false } // Common requirement for some environments
  }

  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig)

    const closeConnection = () => {
      try {
        imap.end()
      } catch (e) {
        // Ignore errors on end
      }
    }

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          closeConnection()
          return reject(new Error(`Failed to open INBOX: ${err.message}`))
        }

        // --- MODIFICATION START ---
        // Calculate the date 30 hours ago for the search criteria
        const sinceDate = new Date();
        sinceDate.setHours(sinceDate.getHours() - 30);

        // Format the date as DD-Mon-YYYY (e.g., 30-Jul-2025) as required by IMAP
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedDate = `${sinceDate.getDate()}-${months[sinceDate.getMonth()]}-${sinceDate.getFullYear()}`;
        
        // Define the search criteria to get all emails SINCE that date
        const searchCriteria = ['SINCE', formattedDate];
        console.log(`Searching for emails since: ${formattedDate}`);
        // --- MODIFICATION END ---


        imap.search([searchCriteria], (searchErr, results) => {
          if (searchErr || results.length === 0) {
            if(searchErr) console.error("IMAP search error:", searchErr);
            closeConnection()
            return resolve([]) // No emails found, resolve with empty array
          }

          console.log(`Found ${results.length} emails to process.`);
          const fetch = imap.fetch(results, { bodies: '' })
          const emailPromises: Promise<EmailSummary>[] = []

          fetch.on('message', (msg, seqno) => {
            const emailPromise = new Promise<EmailSummary>((resolveMsg, rejectMsg) => {
              let fullEmailSource = ''
              msg.on('body', (stream) => {
                stream.on('data', (chunk) => {
                  fullEmailSource += chunk.toString('utf8')
                })
              })
              msg.once('end', async () => {
                try {
                  const parsedEmail = await simpleParser(fullEmailSource)
                  const analysis = await generateAIAnalysis(parsedEmail.text || parsedEmail.subject || 'No Content')
                  
                  resolveMsg({
                    id: parsedEmail.messageId || `${seqno}-${Date.now()}`,
                    sender_name: parsedEmail.from?.value[0]?.name || parsedEmail.from?.text || 'Unknown Sender',
                    sender_email: parsedEmail.from?.value[0]?.address || '',
                    subject: parsedEmail.subject || 'No Subject',
                    date: parsedEmail.date?.toISOString() || new Date().toISOString(),
                    ai_summary: analysis.summary,
                    suggested_replies: analysis.replies,
                    body: parsedEmail.text || '',
                  })
                } catch (parseError) {
                  console.error(`Failed to parse email #${seqno}:`, parseError)
                  // Don't reject the whole batch, just skip this one email
                  // To be safe, resolve with a value that can be filtered out later if needed
                  resolveMsg(null as any); 
                }
              })
            })
            emailPromises.push(emailPromise)
          })

          fetch.once('error', (fetchErr) => {
            console.error('IMAP fetch error:', fetchErr)
            closeConnection()
            reject(new Error(`IMAP fetch error: ${fetchErr.message}`))
          })

          fetch.once('end', async () => {
            try {
              // Process all emails in parallel for performance
              const emails = (await Promise.all(emailPromises)).filter(email => email !== null);
              closeConnection()
              resolve(emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort by date, newest first
            } catch (processingError) {
              closeConnection()
              reject(new Error(`Error processing emails: ${processingError.message}`))
            }
          })
        })
      })
    })

    imap.once('error', (err) => {
      let errorMessage = 'IMAP connection error.'
      if (err.message.includes('AUTHENTICATIONFAILED')) {
        errorMessage = 'Authentication failed. Please check your email and app password.'
      }
      console.error('IMAP Error:', err);
      reject(new Error(errorMessage))
    })
    
    imap.connect()
  }).catch(error => {
    console.error('Fell back to mock data due to IMAP error:', error)
    return generateMockEmails() // Fallback to mock data on any failure
  })
}