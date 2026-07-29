/**
 * Who is signed in.
 *
 * One constant rather than a string repeated in the top bar and in the seeded
 * cases: the two have to agree, or My Cases lists cases owned by somebody else
 * while claiming they are yours, and the "Shared with me" tag stops making
 * sense next to them.
 *
 * Megan Bowen is Microsoft's standard demo persona, which keeps the signed-in
 * user in the same fictional universe as the Contoso, Fabrikam, Litware,
 * Woodgrove and Tailspin customers the prototype already ships with.
 */
export const CURRENT_USER = 'Megan Bowen';

/**
 * The same persona as an alias. The Seller Alias field on step 1 is read-only
 * and tells the user it came from their authenticated profile, so it has to name
 * the person the top bar names — otherwise the form contradicts the chrome about
 * who is signed in.
 */
export const CURRENT_USER_ALIAS = 'meganb@microsoft.com';
