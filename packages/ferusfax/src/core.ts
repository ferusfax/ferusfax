// #! /usr/bin/env node

import FerusfaxController from '@controller/controller';

(async () => {
  const controller = new FerusfaxController();
  controller.run();
})();
