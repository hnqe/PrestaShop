<?php
/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

namespace PrestaShop\PrestaShop\Adapter\Language\CommandHandler;

use PrestaShop\PrestaShop\Adapter\File\RobotsTextFileGenerator;
use PrestaShop\PrestaShop\Core\CommandBus\Attributes\AsCommandHandler;
use PrestaShop\PrestaShop\Core\Domain\Language\Command\DeleteLanguageCommand;
use PrestaShop\PrestaShop\Core\Domain\Language\CommandHandler\DeleteLanguageHandlerInterface;
use PrestaShop\PrestaShop\Core\Domain\Language\Exception\DefaultLanguageException;
use PrestaShop\PrestaShop\Core\Domain\Language\Exception\LanguageException;
use Shop;

/**
 * Deletes language using legacy object model
 *
 * @internal
 */
#[AsCommandHandler]
final class DeleteLanguageHandler extends AbstractLanguageHandler implements DeleteLanguageHandlerInterface
{
    /**
     * @var RobotsTextFileGenerator
     */
    private $robotsTextFileGenerator;

    /**
     * @param RobotsTextFileGenerator $robotsTextFileGenerator
     */
    public function __construct(RobotsTextFileGenerator $robotsTextFileGenerator)
    {
        $this->robotsTextFileGenerator = $robotsTextFileGenerator;
    }

    /**
     * {@inheritdoc}
     */
    public function handle(DeleteLanguageCommand $command)
    {
        $language = $this->getLegacyLanguageObject($command->getLanguageId());

        try {
            $this->assertLanguageIsNotDefault($language);
        } catch (DefaultLanguageException) {
            throw new DefaultLanguageException(
                sprintf(
                    'Default language "%s" cannot be deleted',
                    $language->iso_code
                ),
                DefaultLanguageException::CANNOT_DELETE_DEFAULT_ERROR
            );
        }

        $this->assertLanguageIsNotInUse($language);

        // language must be deleted in "ALL SHOPS" context
        Shop::setContext(Shop::CONTEXT_ALL);

        if (false === $language->delete()) {
            throw new LanguageException(sprintf('Failed to delete language "%s"', $language->iso_code));
        }
        $this->robotsTextFileGenerator->generateFile();
    }
}
